#!/usr/bin/env node

var config = require( __dirname + '/../config.json'),
    AccessService = require( __dirname + '/../index'),
    service;
    
// don't run in background...
config.daemon = false;

service = AccessService.createInstance( config );
service.start();

