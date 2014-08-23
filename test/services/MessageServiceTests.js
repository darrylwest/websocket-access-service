/**
 * @class MessageService
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/20/14
 */
var should = require('chai').should(),
    dash = require('lodash'),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    MockMessageClient = require('../mocks/MockMessageClient'),
    MessageService = require('../../lib/services/MessageService');

describe('MessageService', function() {
    'use strict';

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('MessageService');
        opts.client = new MockMessageClient();
        opts.channel = '/test-channel';
        opts.ssid = 'my-unique-id';

        return opts;
    };

    describe('#instance', function() {
        var opts = createOptions(),
            service = new MessageService( opts ),
            methods = [
                'onMessage',
                'onConnect',
                'publish',
                'wrapMessage',
                'getMessageCount',
                'calculateDigest',
                'getId'
            ];

        it('should create an instance of MessageService', function() {
            should.exist( service );
            service.should.be.instanceof( MessageService );

            service.getId().should.equal( opts.ssid );
            service.getMessageCount().should.equal( 0 );
        });

        it( 'should contain all known methods based on method count and type', function() {
            dash.methods( service ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                service[ method ].should.be.a('function');
            });
        });
    });

    describe('wrapMessage', function() {
        it('should wrap a message object with a standard wrapper', function() {
            var opts = createOptions(),
                service = new MessageService( opts ),
                model = 'this is a test message',
                obj = service.wrapMessage( model );

            should.exist( obj );
            obj.ssid.should.equal( opts.ssid );
            obj.ts.should.be.above( Date.now() - 20000 );
            obj.version.should.equal( '1.0' );
            obj.message.should.equal( model );
        });

        it('should wrap a message and calculate the message digest', function() {
            var opts = createOptions(),
                session = '1234567890',
                service,
                model = { alert:'this is a complex message', warning:'danger' },
                obj;

            opts.algorithm = 'sha256';
            service = new MessageService( opts );
            obj = service.wrapMessage( model, session );

            should.exist( obj );
            should.exist( obj.hmac );
            obj.hmac.should.equal( '062786dcf7d992ed36388316790d13fbae86565ddd9348269b6f02f7bee9d18a' );
        });
    });
});
