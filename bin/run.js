#!/usr/bin/env node

var config = require( __dirname + '/config' ).readAccessHubConfig(),
    hub;
    
// don't run in background...
config.daemon = false;

hub = require( __dirname + '/../index').createInstance( config );
hub.start();

