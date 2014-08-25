/**
 * @class UserAccessDao
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/24/14
 */
var dash = require('lodash'),
    uuid = require('node-uuid');

var UserAccessDao = function(options) {
    'use strict';

    var dao = this,
        log = options.log,
        users = options.users;

    this.findUserById = function(id) {
        log.info('find user by id: ', id);

        var user = dash.find( users, id );

        return user;
    };

    this.createSession = function(user) {
        log.info('create a session for user: ', user.id);

        user.session = uuid.v4();

        return user;
    };

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
};

module.exports = UserAccessDao;