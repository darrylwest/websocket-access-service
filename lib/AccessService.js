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
        producer = options.producer,
        tid = options.tid,
        userService = options.userService,
        currentToken,
        channel = options.channel,
        id = options.appkey || uuid.v4();

    this.start = function() {
        // if the producer hasn't been created then create
        if (!producer) {
            if (!channel) {
                channel = AccessService.DEFAULT_CHANNEL;
            }

            var hub = MessageHub.createInstance( { port:port, hubName:hubName } );
            producer = hub.createProducer( channel, id );
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
            log.info('broadcast the current token: ', currentToken);
            producer.publish( { token:currentToken } );
        }

        return currentToken;
    };

    this.messageHandler = function(message) {

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
    if (!userService) throw new Error('server must be constructed with an user service');
};

AccessService.DEFAULT_CHANNEL = '/access';

AccessService.createInstance = function(config) {
    'use strict';

    var service;

    if (!config) throw new Error('must be constructed with a config object');

    // don't damage the original
    config = dash.clone( config );

    // determine the logging
    if (!config.log) {
        config.log = require('simple-node-logger').createSimpleLogger();
    }

    if (!config.userService) {
        config.userService = {}; // createUserService( config );
    }

    service = new AccessService( config );

    return service;
};

module.exports = AccessService;
