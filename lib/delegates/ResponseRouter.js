/**
 * @class ResponseRouter
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/25/14
 */
var dash = require('lodash'),
    uuid = require('node-uuid');

var ResponseRouter = function(options) {
    'use strict';

    var router = this,
        log = options.log,
        dao = options.dao,
        hub = options.hub;

    /**
     * route the access channel request; the request must contain a recognized action
     * and a known user
     *
     * @param request the full message including ssid, ts, and message
     */
    this.routeRequest = function(request) {
        log.info('route the request: ', JSON.stringify( request ));

        var action = request.action,
            user = request.user;

        if (action && user && typeof router[ action ] === 'function') {

            var validUserCallback = function(err, accessUser) {
                if (!err && accessUser) {
                    request.accessUser = accessUser;

                    router[ action ]( request );
                } else {
                    log.error( err );
                }
            };

            dao.findUserById( user.id, validUserCallback );
        } else {
            log.warn('invalid request: ', JSON.stringify( request ));
        }
    };

    this.openPrivateChannel = function(request, callback) {
        var user = request.accessUser,
            token = request.token,
            ssid = Math.round( Math.random() * 100000 ),
            channel = user.privateChannel,
            consumer;

        log.info('open private channel for user: ', user.id, ', channel: ', channel, ', ssid: ', ssid);

        consumer = hub.createConsumer( channel, ssid );
        consumer.onMessage(function(msg) {
            log.info('message ssid: ', msg.ssid);
            var action = msg.message.action;

            // route the response
            var responseCallback = function(err, response) {
                if (err) {
                    log.error( err );
                } else {
                    consumer.publish( response );
                }
            };

            var authenticate = function(request, callback) {
                var hash = consumer.calculateDigest( user.accessKey, token);

                callback( null, { status:hash === request.hash ? 'ok' : 'failed' } );
            };

            if (msg.ssid !== ssid && action) {
                log.info('received private message: ', JSON.stringify( msg ));

                if (msg.message.action === 'authenticate') {
                    authenticate( msg.message, responseCallback );
                } else {
                    log.warn('invalid action: ', msg.message.action);
                }
            } else {
                log.debug( 'my message echoed: ', ssid );
            }
        });

        consumer.onConnect(function() {
            log.info('connected to private channel: ', channel);
            consumer.publish( { status:'ready' });

            setTimeout(function() {
                consumer.close();
            }, 6000);
        });

        if (callback) {
            callback( null, 'ok' );
        }
    };

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
    if (!dao) throw new Error('server must be constructed with a dao');
    if (!hub) throw new Error('server must be constructed with a message hub');
};

module.exports = ResponseRouter;
