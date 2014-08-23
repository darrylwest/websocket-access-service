#!/usr/bin/env node

var config = require( __dirname + '/config' ).readMessageHubConfig(),
    hub;
    
// run in background...
config.daemon = true;

hub = require( __dirname + '/../index').createInstance( config );

