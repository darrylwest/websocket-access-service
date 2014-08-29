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
        accessHub,
        accessQueue = [],
        aid = Math.random().toString(20),
        pid = Math.random().toString(20),
        accessToken;

    this.authenticate = function() {
        this.openAccessChannel();
        this.openPrivateChannel();
    };

    this.openAccessChannel = function() {
        var hub = client.createHub(),
            channel = hub.subscribe( '/access', client.accessMessageHandler );

        log.info('open the access channel: ', channel);

        channel.then(function() {
            log.info('access channel alive...');
        });

        return channel;
    };

    this.openPrivateChannel = function() {
        var hub = client.createHub(),
            channel = hub.subscribe( user.privateChannel, client.privateMessageHandler );

        log.info('open the private channel: ', channel);

        channel.then(function() {
            log.info('private channel alive...');
            var request = {};

            request.user = { id:user.id, session:user.session };
            request.action = 'openPrivateChannel';

            accessQueue.push( request );
        });

        return channel;
    };

    this.wrapMessage = function(id, request) {
        var message = {
            ssid:id,
            ts:Date.now(),
            message:request
        };

        return message;
    };

    this.accessMessageHandler = function(msg) {
        window.lastAccessMessage = msg;

        if (accessQueue.length > 0) {
            var request = accessQueue.pop(),
                message;

            // grab the current token
            accessToken = request.token = msg.message.token;

            message = client.wrapMessage( aid, request );
            log.info( JSON.stringify( message ) );

            accessHub.publish( '/access', message );

            // now create and queue the private message
            client.createAuthMessage();
        }
    };

    this.privateMessageHandler = function(msg) {
        log.info( 'p-msg: ', JSON.stringify( msg ));

        var status = msg.message.status;
        if (status) {
            switch (status) {
                case 'ready':
                    client.sendPrivateMessage();
                    break;
                case 'ok':
                    log.info('load and show the main page');
                    break;
                case 'failed':
                    log.info('load and show the error page');
                    break;
            }
        }
    };

    this.sendPrivateMessage = function() {
        var message = client.createAuthMessage();
        log.info('send the authenticate message: ', JSON.stringify( message ));

        accessHub.publish( user.privateChannel, message );
    };

    this.createAuthMessage = function() {
        log.info('access key: ', user.accessKey, ', token: ', accessToken );

        var request = {};

        // create a message hash for the access key and send: createDigest
        request.id = user.id;
        request.hash = client.calculateDigest( user.accessKey, accessToken );
        request.session = user.session;
        request.action = 'authenticate';

        return client.wrapMessage( pid, request );
    };

    this.setUserAccessKey = function(key) {
        user.accessKey = client.calculateDigest( key, user.privateChannel );
        log.info('hash: ', user.accessKey);
        if (user.accessKey !== 'fad982743e558ad68da42ad49c3b489e9c15781f83052335c01f11930daf828b') {
            log.error('keys do not match');
        } else {
            log.info('keys match');
        }
    };

    this.calculateDigest = function(value, key) {
        var hash,
            hmac = CryptoJS.algo.HMAC.create( CryptoJS.algo.SHA256, key );

        hmac.update( value );
        hash = hmac.finalize();

        return hash.toString( CryptoJS.enc.Hex );
    };

    this.createHub = function() {
        if (!accessHub) {
            accessHub = new Faye.Client( socketHost, { timeout:10 });
        }

        return accessHub;
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