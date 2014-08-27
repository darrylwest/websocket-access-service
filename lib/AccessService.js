/**
 * @class AccessService
 * @classdesc AccessService generates and broadcasts tokens under two conditions: 1) after
 * a token is used by a client, and 2) each 300 to 900 milliseconds.
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/24/14
 */
var dash = require('lodash'),
    crypto = require('crypto'),
    uuid = require('node-uuid'),
    MessageHub = require('node-messaging-commons'),
    ResponseRouter = require('./delegates/ResponseRouter'),
    UserAccessDao = require('./dao/UserAccessDao');

var AccessService = function(options) {
    'use strict';

    var service = this,
        log = options.log,
        channel = options.channel,
        producer = options.producer,
        tid = options.tid,
        hub = options.hub,
        router = options.router,
        currentToken,
        id = options.id || uuid.v4();

    /**
     * start the producer channel and create the timer to broadcast tokens
     */
    this.start = function() {
        service.createProducer();
        service.createIntervalThread();
    };

    /**
     * create the message producer
     */
    this.createProducer = function() {
        if (!producer) {
            if (!channel) {
                channel = AccessService.DEFAULT_CHANNEL;
            }

            producer = hub.createProducer( channel, id );

            producer.onMessage( service.messageHandler );
        }
    };

    /**
     * create the interval thread
     */
    this.createIntervalThread = function() {
        if (!tid) {
            log.info('create the interval timer');

            setInterval( service.broadcastCurrentToken, 1000 );
        }
    };

    /**
     * broadcast the token to all listeners; make the supplied token current; if token is
     * not supplied then create one.
     *
     * @param token - optional current token
     * @returns the current token
     */
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
                    router.routeRequest( request );
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
     * shutdown the interval thread and producer
     */
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

    /**
     * return the current token
     */
    this.getCurrentToken = function() {
        return currentToken;
    };

    this.__protected = function() {
        return {
            id:id
        };
    };

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
    if (!router) throw new Error('server must be constructed with a message response router');
    if (!hub) throw new Error('server must be constructed with a message hub');
};

AccessService.DEFAULT_CHANNEL = '/access';

AccessService.createInstance = function(config) {
    'use strict';

    var service,
        logManager;

    if (!config) throw new Error('must be constructed with a config object');
    if (!config.port) throw new Error('server must be constructed with a port');
    if (!config.hubName) throw new Error('server must be constructed with a hub name');

    // don't damage the original
    config = dash.clone( config );

    logManager = require('simple-node-logger').createLogManager();

    var createUserAccessDao = function() {
        var opts = dash.clone( config );

        opts.log = logManager.createLogger('UserAccessDao');
        opts.users = require( __dirname + '/../users.json');

        return new UserAccessDao( opts );
    };

    var createResponseRouter = function() {
        var opts = dash.clone( config );

        opts.log = logManager.createLogger('ResponseRouter');
        opts.dao = createUserAccessDao();


        return new ResponseRouter( opts );
    };

    var createAccessService = function() {
        var opts = dash.clone( config );

        opts.log = logManager.createLogger('AccessService');



        if (!opts.router) {
            opts.router = createResponseRouter();
        }

        return new AccessService( opts );
    };

    if (!config.hub) {
        config.hub = MessageHub.createInstance( config );
    }

    return createAccessService();
};

module.exports = AccessService;
