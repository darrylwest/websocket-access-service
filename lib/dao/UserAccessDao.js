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
            log.error( err );
        } else {
            log.info('user found: ', JSON.stringify( user ));
        }

        callback( err, user );
    };

    this.authenticate = function(request, callback) {
        log.info('authenticate the user: ', JSON.stringify( request ));
        var uid = request.id,
            session = request.session;

        var userFoundCallback = function(err, user) {
            if (err) return callback( err );

            if (dao.calculateDigest) {
                var status = (user.accessKey === request.hash ? 'ok' : 'failed');

                if (status !== 'ok') {
                    log.warn('ukey: ', user.accessKey);
                    log.warn('hash: ', request.hash);
                }

                callback( null, { status:status });
            } else {
                err = new Error('digest calculator not defined!');
            }
        };

        dao.findUserById( uid, userFoundCallback );
    };

    // must be
    this.calculateDigest = null;

    // refresh user list...

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
};

module.exports = UserAccessDao;