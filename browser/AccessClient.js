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
        user = options.user,
        socketHost = options.socketHost,
        hub,
        accessQueue = [],
        accessChannel,
        privateChannel,
        accessToken;

    this.start = function() {
        this.openAccessChannel();
        this.openPrivateChannel();
    };

    this.openAccessChannel = function() {
        var channel = '/access';

        log.info('open the access channel: ', channel);

        accessChannel = client.createHub().subscribe( channel, client.accessMessageHandler );
        accessChannel.then(function() {
            log.info('access channel alive...');
        });

        return accessChannel;
    };

    this.openPrivateChannel = function() {
        var channel = user.privateChannel;

        log.info('open the private channel: ', channel);

        privateChannel = client.createHub().subscribe( channel, client.privateMessageHandler );
        privateChannel.then(function() {
            log.info('private channel alive...');
        });
    };

    this.accessMessageHandler = function(msg) {
        window.lastAccessMessage = msg;

        if (accessQueue.length > 0) {
            var request = accessQueue.pop();

            // grab the current token
            accessToken = request.token = msg.message.token;
            log.info( JSON.stringify( request ) );

            accessToken.publish( request );

            // now create and queue the private channel

        }
    };

    this.privateMessageHandler = function(msg) {
        log.info( 'p-msg: ', JSON.stringify( msg ));

        var status = msg.message.status;
        if (status) {
            switch (status) {
                case 'ready':
                    break;
                case 'ok':
                    break;
                case 'failed':
                    break;
            }
        }
    };

    this.createAuthMessage = function() {
        log.info('access key: ', user.accessKey, ', token: ', accessToken );

        var request = {};

        // create a message hash for the access key and send: createDigest
        request.id = user.id;
        request.hash = client.calculateDigest( user.accessKey, accessToken );
        request.session = user.session;
        request.action = 'authenticate';

        return request;
    };

    this.setUserAccessKey = function(key) {
        user.accessKey = client.calculateDigest( key, user.privateChannel );
        log.info('hash: ', user.accessKey);
    };

    this.calculateDigest = function(value, key) {
        var hash,
            hmac = CryptoJS.algo.HMAC.create( CryptoJS.algo.SHA256, key );

        hmac.update( value );
        hash = hmac.finalize();

        return hash.toString( CryptoJS.enc.Hex );
    };

    this.createHub = function() {
        if (!hub) {
            hub = new Faye.Client( socketHost, { timeout:10 });
        }

        return hub;
    };

    // constructor validations
    if (!log) throw new Error('access client must be constructed with a log');
    if (!user) throw new Error('access client must be constructed with a user');
};

AccessClient.createInstance = function(opts) {
    'use strict';

    if (!opts) opts = {};

    opts.version = '2014.08.28';

    opts.log = RemoteLogger.createLogger('AccessClient');

    // simulate an ajax fetch...

    opts.host = 'http://localhost:29169';
    opts.hubName = '/MessageHub';
    opts.appkey = 'b55d91a2-a68f-48a1-8f4b-c4dfc65d60bb';

    opts.socketHost = opts.host + opts.hubName;

    return new AccessClient( opts );
};

if (typeof module === 'object') {
    module.exports = AccessClient;
}