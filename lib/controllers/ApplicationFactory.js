/**
 * @class ApplicationFactory
 * @classdesc create the server; read the static page; start the message server
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 2014-08-17
 */
var dash = require('lodash'),
    MessageService = require('../services/MessageService'),
    MessageSocketService = require('../services/MessageSocketService');

var ApplicationFactory = function(options) {
    'use strict';

    var factory = this,
        log = options.log,
        logManager = options.logManager,
        faye = options.faye || require('faye'),
        port = options.port,
        hubName = options.hubName,
        messageURL = options.messageURL || [ 'http://localhost:', port, hubName ].join(''),
        messageClient = options.messageClient,
        messageSocketService = options.messageSocketService;

    if (!logManager) {
        // construct a logger
        (function() {
            var SimpleLogger = require('simple-node-logger');
            logManager = new SimpleLogger( options );

            // TODO parse options for more complex configurations
            logManager.createConsoleAppender();
        })();
    }

    if (!log) {
        log = logManager.createLogger('ApplicationFactory');
    }

    /**
     *
     * @returns the message socket service (hub)
     */
    this.createMessageSocketService = function() {
        if (!messageSocketService) {
            log.info('create the message socket service');

            var opts = dash.clone( options );

            log.info('port: ', opts.port);

            opts.log = logManager.createLogger('MessageSocketService');
            opts.faye = faye;

            messageSocketService = new MessageSocketService( opts );
        }

        return messageSocketService;
    };

    /**
     * create a message service
     *
     * @param channel - the channel name; should begin with a slash (/)
     * @param id - optional unique id for this service
     * @returns - the message service object
     */
    this.createMessageService = function(channel, id) {
        var service,
            opts = dash.clone( options );

        opts.log = logManager.createLogger( 'MessageService:' + channel );
        opts.client = factory.createMessageClient();
        opts.channel = channel;

        if (id) {
            opts.ssid = id;
        }

        service = new MessageService( opts );

        return service;
    };

    this.createMessageClient = function() {
        if (!messageClient) {
            log.info('create the faye message client');

            messageClient = new faye.Client( messageURL );
        }

        return messageClient;
    };

    /**
     * create and start the message server
     */
    this.initialize = function() {
        log.info('initialize the server, version: ', options.version);
        factory.createMessageSocketService();
    };

    this.createLogger = function(name, level) {
        return logManager.createLogger( name, level );
    };
};

module.exports = ApplicationFactory;
