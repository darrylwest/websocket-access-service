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
        log.info('send the response: ', response);
    };

    this.authenticate = function(request, callback) {
        log.info('authenticate the user: ', JSON.stringify( request ));
    };

    this.openPrivateChannel = function(request, callback) {
        log.info('open private channel for user: ', JSON.stringify( request ));

        // find or open the private channel

        var channel = request.user.privateChannel;

        log.info('private channel: ', channel);

        if (!sockets[ channel ]) {
            log.info('create the private channel: ', channel);
        }

        callback( null, 'ok' );
    };

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
    if (!dao) throw new Error('server must be constructed with a dao');
};

module.exports = ResponseRouter;
