/**
 * @class AccessService
 * @classdesc AccessService generates and broadcasts tokens under two conditions: 1) after
 * a token is used by a client, and 2) each 100 to 300 milliseconds.
 *
 *
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/24/14
 */
var dash = require('lodash'),
    crypto = require('crypto'),
    uuid = require('node-uuid'),
    MessageHub = require('node-messaging-commons');

var AccessService = function(options) {
    'use strict';

    var service = this,
        log = options.log,
        port = options.port,
        hubName = options.hubName,
        channel = options.channel,
        producer = options.producer,
        tid = options.tid,
        router = options.router,
        currentToken,
        id = options.appkey || uuid.v4();

    this.start = function() {
        // if the producer hasn't been created then create
        if (!producer) {
            if (!channel) {
                channel = AccessService.DEFAULT_CHANNEL;
            }

            var hub = MessageHub.createInstance( { port:port, hubName:hubName } );
            producer = hub.createProducer( channel, id );

            producer.onMessage( service.messageHandler );
        }

        // if the timer hasn't been created then create

        if (!tid) {
            log.info('create the interval timer');

            setInterval( service.broadcastCurrentToken, 1000 );
        }
    };

    this.broadcastCurrentToken = function(token) {
        currentToken = token ? token : uuid.v4();

        if (producer) {
            log.debug('broadcast the current token: ', currentToken);
            producer.publish( { token:currentToken } );
        }

        return currentToken;
    };

    /**
     * handle the incoming messages;
     * - skip messages that aren't from clients
     * - route messages and re-issue token when current token detected
     * - ignore messages that don't include current token
     *
     * @param message must contain message.message.user and message.message.action
     */
    this.messageHandler = function(msg) {
        var wasRouted = false;
        // ignore the producer messages
        if (msg.ssid !== id && msg.message) {
            log.debug('message received: ', JSON.stringify( msg ));

            var request = msg.message,
                token = request.token;

            if (token === currentToken) {
                process.nextTick(function() {
                    router.routeMessage( request );
                });

                wasRouted = true;

                // create a new token and broadcast it
                currentToken = uuid.v4();
                service.broadcastCurrentToken( currentToken );
            }
        }

        return wasRouted;
    };

    /**
     * route the client request
     *
     * @param request
     */
    this.routeMessage = function(request) {
        var user = request.user,
            action = request.action,
            responseCallback;

        responseCallback = function(err, response) {
            if (err) {
                log.error( err );
            } else {
                producer.publish( response );
            }
        };

    };

    this.shutdown = function() {
        log.info('shut down the producer');

        if (producer) {
            // is this correct?  shouldn't there be a close() method?
            producer.cancel();
        }

        if (tid) {
            clearInterval( tid );
        }
    };

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
    if (!port) throw new Error('server must be constructed with a port');
    if (!hubName) throw new Error('server must be constructed with a hub name');
    if (!router) throw new Error('server must be constructed with a message response router');
};

AccessService.DEFAULT_CHANNEL = '/access';

AccessService.createInstance = function(config) {
    'use strict';

    var service,
        dao;

    if (!config) throw new Error('must be constructed with a config object');

    // don't damage the original
    config = dash.clone( config );

    // determine the logging
    if (!config.log) {
        config.log = require('simple-node-logger').createSimpleLogger();
    }

    if (!config.router) {
        config.router = {};
        config.router.routeMessage = function(request) {
            console.log('! route message: ', JSON.stringify( request ));
        };
    }

    service = new AccessService( config );

    return service;
};

module.exports = AccessService;
