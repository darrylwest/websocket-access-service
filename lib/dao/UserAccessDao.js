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

    this.findUserById = function(id, callback) {
        log.info('find user by id: ', id);

        var user = dash.find( users, { id:id } ),
            err;

        if (!user) {
            err = new Error('user not found for id: ' + id);
        }

        callback( err, user );
    };

    this.createSession = function(user, callback) {
        log.info('create a session for user: ', user.id);

        var err;

        user.session = uuid.v4();

        callback( err,  user );
    };

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
};

module.exports = UserAccessDao;