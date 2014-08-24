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
    AccessService = require('../lib/AccessService');

describe('AccessService', function() {
    'use strict';

    var MockUserService = function() {

        this.getUserById = function(id) {
            // TODO create an AccessUser model?
            var user = {
                id:id,
                session:'my-user-session',
                pwhash:'hash'
            };

            return user;
        };
    };

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('AccessService');
        opts.port = 12345;
        opts.hubName = 'AccessHub';
        opts.userService = new MockUserService();

        return opts;
    };

    describe('#instance', function() {
        var service = new AccessService( createOptions()),
            methods = [
                'start',
                'shutdown',
                'broadcastCurrentToken',
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
});
