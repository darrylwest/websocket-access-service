# Websocket Access Service
- - -

[![Build Status](https://travis-ci.org/darrylwest/websocket-access-service.svg?branch=master)](https://travis-ci.org/darrylwest/websocket-access-service)

A non-traditional access service that leverages websockets to provide user authentication.

## Introduction

The Websocket Access Service uses [tokenized gated messaging](http://blog.raincitysoftware.com/) and shared keys to accept or deny access to resources.  It is designed to be used with an existing multi-channel messaging hub like [node-messaging-commons](https://github.com/darrylwest/node-messaging-commons) but will work with other messaging systems as well.

## Installation

### Server

~~~
	npm install websocket-access-service --save
~~~

### Client/Browser



## Client Use

- create consumer access channel
- prompt for password
- create private producer channel
- wait for access token and send request to listen on private channel
- broadcast data on private channel
- wait for response (with timeout)
- on response, close the private channel
- on positive response, do action A
- on negative response, do action B
- on timeout, re-broadcast and wait


### Server

~~~
	var AccessService = require('websocket-access-service');
~~~



## Tests

### Unit Tests
Unit tests include should/specs, jshint and validate-package.  Tests can be run from the command line with this:

~~~
    make test
    
    or

    make watch

    or

    grunt mochaTest jshint validate-package
~~~

- - -
<p><small><em>Copyright © 2014, rain city software | Version 0.90.10</em></small></p>
