#!/usr/bin/env node

var dash = require('lodash'),
    uuid = require('node-uuid'),
    config = require( __dirname + '/../config.json' ),
    AccessService = require( __dirname + '/../index' ),
    MessageHub = require( 'node-messaging-commons' ),
    hub = MessageHub.createInstance( config ),
    consumer = hub.createConsumer( AccessService.DEFAULT_CHANNEL ),
    producer,
    consumerQueue = [],
    authMessage,
    users = require( __dirname + '/../users.json' ),
    user = users[ 1 ],
    messageCount = 0;

var createPrivateChannel = function() {
    console.log('create the private channel for: ', user.privateChannel );

    producer = hub.createProducer( user.privateChannel, user.session );

    producer.onMessage(function(msg) {
        if (msg.ssid !== user.session) {
            console.log('p<< ', msg);

            // simply exit on any message received
            var status = msg.message.status;
            if (status === 'ready') {
                sendPrivateMessage( authMessage );
            } else {
                process.nextTick(function() {
                    console.log('^^ private message received, process exiting...');
                    consumer.close();
                    process.exit();
                });
            }
        }
    });
};

var sendPrivateMessage = function(request) {
    console.log('send the private message: ', JSON.stringify( request ));

    producer.publish( request );

    setTimeout(function() {
        console.error('!! private channel message timed out, re-send...');

        messageCount++;

        if (messageCount < 3) {
            console.log('re-transmit request');
            sendPrivateMessage( request );
        } else {
            process.exit(1);
        }

    }, 2000);
};

var createAuthMessage = function() {
    var request = {};

    request.user = user;

    // for the 
    request.id = user.id;
    request.hash = 'bad-hash';
    request.session = user.session;
    request.action = 'authenticate';

    authMessage = request;
};

consumer.onConnect(function(chan) {
    console.log('c>> connected to access service: ', chan);
});

// consumer messages trigger sending a private message request
consumer.onMessage(function(msg) {
    // console.log( 'c>> ', JSON.stringify( msg ));

    if (consumerQueue.length > 0) {
        var request = consumerQueue.pop();

        // pass the latest/current token
        request.token = msg.message.token;

        console.log('c<< ', JSON.stringify( request ));
        consumer.publish( request );

        createAuthMessage();
    }
});

// wait to simulate a login process
setTimeout(function() {

    var request = {};

    request.user = user;
    request.action = 'openPrivateChannel';

    consumerQueue.push( request );
}, 1000);

// create the private producer channel first
createPrivateChannel();
