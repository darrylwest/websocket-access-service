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
        user = options.user,
        socketHost = options.socketHost,
        hub,
        accessChannel,
        privateChannel;

    this.createHub = function() {
        if (!hub) {
            hub = new Faye.Client( socketHost, { timeout:10 });
        }

        return hub;
    };

    this.openAccessChannel = function() {
        log.info('open the access channel');

        accessChannel = client.createHub().subscribe( '/access', client.accessMessageHandler );
        accessChannel.then(function() {
            accessChannel.ready = true;
        });

        return accessChannel;
    };

    this.accessMessageHandler = function(msg) {
        log.debug( JSON.stringify( msg ));

        
    };

    this.openPrivateChannel = function() {
        log.info('create the private channel');
    };

    this.createAuthMessage = function() {
        log.info('create the auth request message');
    };

    // constructor validations
    if (!log) throw new Error('access client must be constructed with a log');
    if (!user) throw new Error('access client must be constructed with a user');
};

AccessClient.createInstance = function() {
    'use strict';

    var opts = {};

    opts.version = '2014.08.28';

    opts.log = RemoteLogger.createLogger('AccessClient');
    opts.createDigest = function(key) {
        return CryptoJS.algo.HMAC.create( CryptoJS.algo.SHA256, key );
    };

    // simulate an ajax fetch...
    opts.user  = {
        id:'33e2c605f0334ce7a455ec8f6a60e063',
        session:'2a7f543a-5a4e-44db-a150-b653852ed0c0',
        privateChannel:'/44C4UUX'
    };

    opts.host = 'http://localhost:29169';
    opts.hubName = '/MessageHub';
    opts.appkey = 'b55d91a2-a68f-48a1-8f4b-c4dfc65d60bb';

    opts.socketHost = opts.host + opts.hubName;

    return new AccessClient( opts );
};