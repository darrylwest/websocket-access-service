/**
 * @class AccessService
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/24/14
 */
var should = require('chai').should(),
    dash = require('lodash'),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    UserAccessDataset = require('./fixtures/UserAccessDataset'),
    // MockMessageClient = require('node-messaging-commons').mocks.MockMessageClient,
    MessageHub = require('node-messaging-commons'),
    AccessService = require('../lib/AccessService'),
    ResponseRouter = require('../lib/delegates/ResponseRouter'),
    UserAccessDao = require('../lib/dao/UserAccessDao');

describe('AccessService', function() {
    'use strict';

    var dataset = new UserAccessDataset();

    var createUserAccessDao = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('UserAccessDao');
        opts.users = dataset.createUserList();

        return new UserAccessDao( opts );
    };

    var createResponseRouter = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('ResponseRouter');
        opts.dao = createUserAccessDao();
        opts.hub = {};

        return new ResponseRouter( opts );
    };

    var createMessageHub = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('MessageHub');
        opts.port = 12345;
        opts.hubName = 'AccessHub';

        return MessageHub.createInstance( opts );
    };

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('AccessService');
        opts.router = createResponseRouter();
        opts.hub = createMessageHub();

        opts.id = 'access-service-id';

        return opts;
    };

    describe('#instance', function() {
        var service = new AccessService( createOptions()),
            methods = [
                'start',
                'createProducer',
                'createIntervalThread',
                'shutdown',
                'broadcastCurrentToken',
                'messageHandler',
                'getCurrentToken',
                '__protected'
            ];

        it('should create an instance of AccessService', function() {
            should.exist( service );
            service.should.be.instanceof( AccessService );
        });

        it( 'should contain all known methods based on method count and type', function() {
            dash.methods( service ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                service[ method ].should.be.a('function');
            });
        });
    });

    describe('start', function() {
        var service = new AccessService( createOptions());

        it('should create the producer and interval thread', function() {
            var producerCreated = false,
                intervalCreated = false;

            service.createProducer = function() {
                producerCreated = true;
            };

            service.createIntervalThread = function() {
                intervalCreated = true;
            };

            service.start();

            producerCreated.should.equal( true );
            intervalCreated.should.equal( true );
        });
    });

    describe('broadcastCurrentToken', function() {
        var service = new AccessService( createOptions());

        it('should create the current token', function() {
            var token = service.broadcastCurrentToken();

            should.exist( token );
            token.should.equal( service.getCurrentToken() );
        });
    });

    describe('messageHandler', function() {
        var opts = createOptions(),
            service = new AccessService( opts ),
            user = dataset.createKnownUser();

        it('should accept and route a client message with current token', function() {
            var request = {},
                message;

            request.user = user;
            request.token = service.broadcastCurrentToken();
            message = dataset.wrapRequestMessage( request );

            service.messageHandler( message).should.equal( true );

            request.token.should.not.equal( service.getCurrentToken() );
        });

        it('should ignore a message if token has expired', function() {
            var request = {},
                message;

            request.user = user;
            request.token = service.broadcastCurrentToken();
            request.token = 'old-token';

            message = dataset.wrapRequestMessage( request );

            service.messageHandler( message).should.equal( false );
        });

        it('should ignore a producer message', function() {
            var request = {},
                message;

            request.user = user;
            request.token = service.broadcastCurrentToken();

            message = dataset.wrapRequestMessage( request, opts.id );

            service.messageHandler( message).should.equal( false );
        });
    });
});
