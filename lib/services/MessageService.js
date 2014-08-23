/**
 * @class MessageService
 * @classdesc Subscribe to a channel; distribute messages to listeners when they arrive
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/19/14
 */
var crypto = require('crypto'),
    dash = require( 'lodash' );

var MessageService = function(options) {
    'use strict';

    var service = this,
        log = options.log,
        algorithm = options.algorithm,
        hmacEncoding = options.hmacEncoding || 'hex',
        client = options.client,
        channel = options.channel,
        ssid = options.ssid,
        subscribed = false,
        listeners = [],
        connectListeners = [],
        count = 0;

    /**
     * add a subscriber/listener to this message stream
     *
     * @param listener - function( message )
     */
    this.onMessage = function(listener) {
        if (!subscribed) {
            log.info('subscribe to channel: ', channel);
            client.subscribe( channel, messageHandler );
            client.then( connectHandler );

            subscribed = true;
        }

        log.info('add listener to channel: ', channel);
        listeners.push( listener );
    };

    /**
     * send the channel name when a subscription is accepted by the hub
     *
     * @param listener - the handler function
     */
    this.onConnect = function(listener) {
        log.info('add a connection listener...');
        connectListeners.push( listener );
    };

    var connectHandler = function() {
        log.info('message subscription to ', channel, ' accepted, tell listeners: ', connectListeners.length);

        connectListeners.forEach(function(listener) {
            listener( channel );
        });
    };

    var messageHandler = function(message) {
        if (log.getLevel() === 'debug') {
            log.debug('message: ',  JSON.stringify( message ));
        }

        count++;

        listeners.forEach(function(listener) {
            listener( message );
        });
    };

    /**
     * publish message (model) to the channel by wrapping in the standard wrapper
     *
     * @param model - data to publish
     * @param session - optional session key used for message digest
     */
    this.publish = function(model, session) {
        var msg = service.wrapMessage( model, session );

        count++;

        if (log.getLevel() === 'debug') {
            log.debug('publish message: ', msg);
        }

        client.publish( channel, msg );
    };

    /**
     * @returns the total number of messages processed
     */
    this.getMessageCount = function() {
        return count;
    };

    /**
     * provides a standard message wrapper including timestamp (ts), version, uid and message.  override
     * this to provide alternate wrapper(s).
     *
     * @param model - the message model - can be a simple string or complex object
     * @param session - an optional session key used to generate message digest
     * @returns the wrapped message object
     */
    this.wrapMessage = function(model, session) {
        var obj = {
            ts:Date.now(),
            version:'1.0'
        };

        if (ssid) {
            obj.ssid = ssid;
        }

        obj.message = model;

        if (algorithm && session) {
            obj.hmac = service.calculateDigest( model, session );
        }

        return obj;
    };

    /**
     * stringify the value and use the key to generate an hmac digest
     *
     * @param value - message object or string
     * @param key - the session key
     * @returns the calculated hmac code in the specified hmacEncoding (defaults to hex)
     */
    this.calculateDigest = function(value, key) {
        var json = JSON.stringify( value ),
            hmac = crypto.createHmac( algorithm, dash.isString( key ) ? key : key.toString() ),
            code;

        hmac.update( json );
        code = hmac.digest( hmacEncoding );

        return code;
    };

    /**
     * return the service's id if set on construction
     */
    this.getId = function() {
        return ssid;
    };

    // constructor validations
    if ( !log ) throw new Error( 'service must be constructed with a logger' );
    if ( !client ) throw new Error( 'service must be constructed with a socket client' );
    if ( !channel ) throw new Error( 'service must be constructed with a channel' );
};

module.exports = MessageService;
