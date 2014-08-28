/**
 * @class AccessClient
 *
 * @author: darryl.west@roundpeg.com
 * @created: 8/27/14
 */

var AccessClient = function(options) {
    'use strict';

    var client = this,
        log = options.log,
        createDigest = options.createDigest,
        user;

    this.createPrivateChannel = function() {
        log.info('create the private channel');
    };

    this.createAuthMessage = function() {
    };


    this.fetchUser = function(id, callback) {
        // simulate an ajax fetch...
        var accessUser = {
                id:'33e2c605f0334ce7a455ec8f6a60e063',
                session:'2a7f543a-5a4e-44db-a150-b653852ed0c0',
                privateChannel:'/44C4UUX'
            };

        callback( null, accessUser );
    };

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
};

AccessClient.createInstance = function() {
    'use strict';
    
    var opts = {};

    opts.log = RemoteLogger.createLogger('AccessClient');
    opts.createDigest = function(key) {
        return CryptoJS.algo.HMAC.create( CryptoJS.algo.SHA256, key );
    };



    return new AccessClient( opts );
};