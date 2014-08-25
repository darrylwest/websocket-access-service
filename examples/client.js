#!/usr/bin/env node

var dash = require('lodash'),
    uuid = require('node-uuid'),
    config = require( __dirname + '/../config.json' ),
    AccessService = require( __dirname + '/../index' ),
    MessageHub = require( 'node-messaging-commons' ),
    hub = MessageHub.createInstance( config ),
    consumer = hub.createConsumer( AccessService.DEFAULT_CHANNEL ),
    queue = [],
    users = require( __dirname + '/../users.json'),
    user = users[0];

var createPrivateChannel = function() {
};

consumer.onConnect(function(chan) {
    console.log('!> connected: ', chan);
});

consumer.onMessage(function(msg) {
    console.log( '>> ', JSON.stringify( msg ));
    if (queue.length > 0) {
        var request = queue.pop();

        // pass the latest/current token
        request.token = msg.message.token;

        console.log('<< ', JSON.stringify( request ));
        consumer.publish( request );

        // now open the private producer socket and publish to it
        process.nextTick(function() {
            createPrivateChannel();
        });
    }
});

setTimeout(function() {
    var request = {};

    request.user = user;
    request.action = 'listen';

    queue.push( request );
}, 2500);

