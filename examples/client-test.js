#!/usr/bin/env node

var dash = require('lodash'),
    config = require( __dirname + '/../config.json' ),
    AccessService = require( __dirname + '/../index' ),
    MessageHub = require( 'node-messaging-commons' ),
    hub = MessageHub.createInstance( config ),
    consumer = hub.createConsumer( AccessService.DEFAULT_CHANNEL ),
    producer,
    consumerQueue = [],
    authMessage,
    accessToken,
    users = require( __dirname + '/../users.json' ),
    user = users[ 0 ],
    messageCount = 0;

var createPrivateChannel = function() {
    console.log('create the private channel for: ', user.privateChannel );

    producer = hub.createProducer( user.privateChannel, user.session );

    producer.onMessage(function(msg) {
        // simply exit on any message received
        var status = msg.message.status;
        if (status) {
            console.log('p<< ', msg);
            if (status === 'ready') {
                sendPrivateMessage( authMessage );
            } else {
                console.log('status: ', status);
                process.nextTick(function() {
                    console.log('^^ private message received, process exiting...');
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

    }, 4000);
};

var createAuthMessage = function() {
    var request = {};

    console.log('access key: ', user.accessKey, ', token: ', accessToken );

    // create a message hash for the access key and send: createDigest
    request.id = user.id;
    request.hash = user.accessKey; // producer.calculateDigest( user.accessKey, accessToken );
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
        accessToken = request.token = msg.message.token;

        console.log('c<< ', JSON.stringify( request ));
        consumer.publish( request );

        createAuthMessage();
    }
});


// open the private channel; create and queue the open private channel request
createPrivateChannel();
var request = {};

request.user = { id:user.id, session:user.session };
request.action = 'openPrivateChannel';

consumerQueue.push( request );
