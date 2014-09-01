# Websocket Access Service
- - -

A non-traditional access service that leverages websockets to provide user authentication.

[![NPM version](https://badge.fury.io/js/websocket-access-service.svg)](http://badge.fury.io/js/websocket-access-service) [![Build Status](https://travis-ci.org/darrylwest/websocket-access-service.svg?branch=master)](https://travis-ci.org/darrylwest/websocket-access-service) [![Dependency Status](https://david-dm.org/darrylwest/websocket-access-service.svg)](https://david-dm.org/darrylwest/websocket-access-service)

## Introduction

The Websocket Access Service uses [tokenized gated messaging](http://blog.raincitysoftware.com/) and shared keys to accept or deny access to resources.  It is designed to be used with an existing multi-channel messaging hub like [node-messaging-commons](https://github.com/darrylwest/node-messaging-commons) but will work with other messaging systems as well.

## Installation

### Server

~~~
	npm install websocket-access-service --save
~~~

### Client/Browser

The project includes a "browser" folder with enough to create a small authentication page.  Once a user enter's their password, it is set then "authenicate" is called. If the backend services are up, then all should work as expected.

Here is a short snippet of the browser code:

~~~
<!DOCTYPE html>
<html>
<head>
    <title>test access page</title>
    <script src="faye-browser.js"></script>
    <script src="RemoteLogger.js"></script>
    <script src="hmac-sha256.js"></script>
    <script src="AccessClient.js"></script>
    <script>
        var client;

        var accessClickHandler = function() {
            // set the password as entered by the user
            client.setUserAccessKey( 'fire-fighter3' );

            // start the websocket process
            client.authenticate();
        };

        var startAccessClient = function() {
            // simulate finding a user with an active session
            var opts = {};
            opts.user  = {
                id:'33e2c605f0334ce7a455ec8f6a60e063',
                session:'2a7f543a-5a4e-44db-a150-b653852ed0c0',
                privateChannel:'/44C4UUX'
            };

            // create the access client instance with user object
            client = AccessClient.createInstance( opts );

            // make available for debugging
            window.client = client;
        };
    </script>
</head>
~~~

## Client Authentication

The AccessClient class does the work of creating the approprate channels and makeing the requests.  Here are the steps...

- prompt for and set the plain text password
- create consumer access channel
- create private producer channel
- wait for access token and send request to listen on private channel
- broadcast data on private channel
- wait for response (with timeout)
- on ready response, send the encoded password (hash)
- on response, close the private channel
- on positive response, do action A
- on negative response, do action B
- on timeout, exit with error

### Server

The project includes a "bin" folder with a run/start/stop and status scripts.  The run script is the same as start, but it runs in the forgound.  It looks something like this:

~~~
	var config = require('./config.json'),
    	AccessService = require('websocket-access-service'),
        service = AccessService.createInstance( config );

    service.start();
~~~

If you have a message service running on this port, then this is enough to start the public producer channel to periodically send out access tokens (one per second).  To create and start a generic message service, see [this commons project](https://www.npmjs.org/package/node-messaging-commons).

## Configuration

Here is a sample configuration file.

~~~
{
    "port":29169,
    "hubName":"/MessageHub",
    "channels":[ "/access" ],
    "algorithm":"sha256",
    "appkey":"b55d91a2-a68f-48a1-8f4b-c4dfc65d60bb"
}
~~~

You would want to have a proxy and preferrably HTTPS in front of this but port 29169 works for development.

## Sample User List

The project inclues a very basic sample of access users.  You would generate and plug in your own keys through some other process.

~~~
[
    {
        "id":"33e2c605f0334ce7a455ec8f6a60e063",
        "session":"2a7f543a-5a4e-44db-a150-b653852ed0c0",
        "privateChannel":"/44C4UUX",
        "accessKey":"<key>"
    },
    {
        "id":"c14975621f564f729323f0e5044fb7ee",
        "session":"4b16e31a-0050-4b00-bc1f-acbe855a5dbc",
        "privateChannel":"/55C4xXufg",
        "accessKey":"<key>"
    }
]
~~

## Tests

Unit tests include should/specs, jshint and validate-package.  Tests can be run from the command line with this:

~~~
    make test

    or

    make watch

    or

    grunt mochaTest jshint validate-package
~~~

- - -
<p><small><em>Copyright © 2014, rain city software | Version 0.90.19</em></small></p>
