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
    console.log('create the private channel for: ', JSON.stringify( user ));

    producer = hub.createProducer( user.privateChannel, user.session );

    producer.onMessage(function(msg) {
        consumer('p<< ', msg);

        process.nextTick(function() {
            process.exit();
        });
    });
};

var sendPrivateMessage = function(request) {
    producer.publish( request );
    setTimeout(function() {
        console.log('private channel message timed out...');
        process.exit(1);

    }, 5000);
};

var queuePrivateMessage = function() {
    var request = {};

    request.user = user;

    // for the 
    request.hash = user.hash;
    request.action = 'login';

    producerQueue.push( request );
};

consumer.onConnect(function(chan) {
    console.log('c>> connected: ', chan);
});

consumer.onMessage(function(msg) {
    console.log( 'c>> ', JSON.stringify( msg ));

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
        var request = producerQueue.pop();
        request.token = msg.message.token;

        sendPrivateMessage( request );
    }
});

setTimeout(function() {
    createPrivateChannel();

    var request = {};

    request.user = user;
    request.action = 'openPrivateChannel';

    consumerQueue.push( request );
}, 2500);

