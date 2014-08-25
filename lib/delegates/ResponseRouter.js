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

    this.routeMessage = function(message) {

    };

    this.authenticate = function(user, callback) {

    };

    this.createSession = function(user, callback) {
        log.info('create a session for user: ', user.id);

        var err;

        user.session = uuid.v4();

        callback( err,  user );
    };

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
    if (!dao) throw new Error('server must be constructed with a dao');
};

module.exports = ResponseRouter;
