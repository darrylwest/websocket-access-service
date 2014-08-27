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
        hub = options.hub,
        sockets = {};

    this.routeRequest = function(request) {
        log.info('route the request: ', JSON.stringify( request ));

        var action = request.action,
            user = request.user;

        if (action && user && typeof router[ action ] === 'function') {

            var validUserCallback = function(err, accessUser) {
                if (!err && accessUser) {
                    request.accessUser = accessUser;

                    router[ action ]( request, router.responseCallback );
                } else {
                    log.error( err );
                }
            };

            dao.findUserById( user.id, validUserCallback );
        } else {
            log.warn('invalid request: ', JSON.stringify( request ));
        }
    };

    this.responseCallback = function(err, response) {
        // log.info('send the response: ', response);
    };

    this.authenticate = function(request, callback) {
        var user = request.user,
            token = request.token,
            hash = request.hash;

        log.info('authenticate the user: ', user.id, ', token: ', token, ', hash: ', hash);
        log.info( JSON.stringify( request ));

        callback( null, { status:'ok' });
    };

    this.openPrivateChannel = function(request, callback) {
        var user = request.user,
            ssid = request.token,
            channel = user.privateChannel,
            consumer;

        log.info('open private channel for user: ', user.id, ', channel: ', channel, ', ssid: ', ssid);

        log.info('create the private channel: ', channel);

        consumer = hub.createConsumer( channel, ssid );
        consumer.onMessage(function(msg) {
            log.info('message ssid: ', msg.ssid);
            var action = msg.message.action;

            if (msg.ssid !== ssid && action) {
                log.info('received private message: ', JSON.stringify( msg ));

                // route the response
                var callback = function(err, response) {
                    if (err) {
                        log.error( err );
                    } else {
                        consumer.publish( response );
                    }
                };

                if (msg.message.action === 'authenticate') {
                    router.authenticate( msg.message, callback);
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
            }, 10000);
        });

        callback( null, 'ok' );
    };

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
    if (!dao) throw new Error('server must be constructed with a dao');
    if (!hub) throw new Error('server must be constructed with a message hub');
};

module.exports = ResponseRouter;
