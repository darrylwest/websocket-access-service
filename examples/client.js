#!/usr/bin/env node

var config = require( __dirname + '/../config.json' ),
    AccessService = require( __dirname + '/../index' ),
    MessageHub = require( 'node-messaging-commons' ),
    hub = MessageHub.createInstance( config ),
    consumer = hub.createConsumer( AccessService.DEFAULT_CHANNEL ),
    token;

console.log( 'hub name: ', config.hubName );

consumer.onConnect(function(chan) {
    console.log('connected...');
    // consumer.publish( { myid:id, say:'howdy! from ' + id } );
});

consumer.onMessage(function(message) {
    console.log( '>>> access token message recieved: ', message );
});

