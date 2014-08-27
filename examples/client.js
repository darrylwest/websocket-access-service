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
    producerQueue = [],
    users = require( __dirname + '/../users.json' ),
    user = users[ 0 ];

var createPrivateChannel = function() {
    console.log('create the private channel for: ', user.privateChannel );

    producer = hub.createProducer( user.privateChannel, user.session );

    producer.onMessage(function(msg) {
        if (msg.ssid !== user.session) {
            console.log('p<< ', msg);

            // simply exit on any message received
            process.nextTick(function() {
                console.log('^^ private message received, process exiting...');
                // process.exit();
            });
        }
    });
};

var sendPrivateMessage = function(request) {
    console.log('send the private message: ', JSON.stringify( request ));

    producer.publish( request );

    setTimeout(function() {
        console.error('!! private channel message timed out, re-send...');
        process.exit(1);

    }, 5000);
};

var queuePrivateMessage = function() {
    var request = {};

    request.user = user;

    // for the 
    request.hash = user.hash;
    request.action = 'authenticate';

    producerQueue.push( request );
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

        process.nextTick(function() {
            queuePrivateMessage();
        });
    } else if (producerQueue.length > 0) {
        console.log('producer queue length: ', producerQueue.length);
        var request = producerQueue.pop();
        request.token = msg.message.token;

        sendPrivateMessage( request );
    }
});

// wait to simulate a login process
setTimeout(function() {
    createPrivateChannel();

    var request = {};

    request.user = user;
    request.action = 'openPrivateChannel';

    consumerQueue.push( request );
}, 1000);

