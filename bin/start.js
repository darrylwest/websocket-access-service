#!/usr/bin/env node

var config = require( __dirname + '/../config.json'),
    AccessService = require( __dirname + '/../index'),
    service;
    
// run in background...
config.daemon = true;

service = AccessService.createInstance( config );
service.start();

