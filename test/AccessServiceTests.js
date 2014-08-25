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
    AccessService = require('../lib/AccessService'),
    UserAccessDao = require('../lib/dao/UserAccessDao');

describe('AccessService', function() {
    'use strict';

    var dataset = new UserAccessDataset();

    var MockResponseRouter = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('ResponseRouter');
        opts.dao = new MockUserAccessDao();

        opts.routeMessage = function(request) {
            console.log('route message: ', JSON.stringify( request ));
        };

        return opts; // new ResponseRouter( opts );
    };

    var MockUserAccessDao = function() {

        var opts = {};

        opts.log = MockLogger.createLogger('UserAccessDao');
        opts.users = {};

        return new UserAccessDao( opts );
    };

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('AccessService');
        opts.port = 12345;
        opts.hubName = 'AccessHub';
        opts.router = new MockResponseRouter();

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
