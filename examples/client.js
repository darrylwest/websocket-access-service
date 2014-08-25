#!/usr/bin/env node

var dash = require('lodash'),
    uuid = require('node-uuid'),
    config = require( __dirname + '/../config.json' ),
    AccessService = require( __dirname + '/../index' ),
    MessageHub = require( 'node-messaging-commons' ),
    hub = MessageHub.createInstance( config ),
    consumer = hub.createConsumer( AccessService.DEFAULT_CHANNEL ),
    token,
    user = {
        id:uuid.v4(),
        name:'john'
    };

consumer.onConnect(function(chan) {
    var request = {
        action:'createSession',
        user:user
    };

    console.log('<< ', JSON.stringify( request ));

    consumer.publish( request );
});

consumer.onMessage(function(message) {
    console.log( '>> ', JSON.stringify( message ));
});

