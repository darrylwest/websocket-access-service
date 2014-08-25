/**
 * @class AccessService
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/24/14
 */
var should = require('chai').should(),
    dash = require('lodash'),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    MockMessageClient = require('node-messaging-commons').mocks.MockMessageClient,
    AccessService = require('../lib/AccessService'),
    UserAccessDao = require('../lib/dao/UserAccessDao');

describe('AccessService', function() {
    'use strict';

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
        opts.dao = new MockUserAccessDao();

        return opts;
    };

    describe('#instance', function() {
        var service = new AccessService( createOptions()),
            methods = [
                'start',
                'shutdown',
                'broadcastCurrentToken',
                'routeMessage',
                'messageHandler'
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

    describe('routeMessage', function() {
        it('should route a message request');
        it('should reject an unknown action');
    });

    describe('messageHander', function() {
        it('should accept and route a client message');
        it('should reject a producer message');
    });
});
