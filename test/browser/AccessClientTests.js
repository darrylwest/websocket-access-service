/**
 *
 * @author: darryl.west@roundpeg.com
 * @created: 8/28/14
 */
var should = require('chai').should(),
    dash = require('lodash'),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    AccessClient = require('../../browser/AccessClient');

describe('AccessClient', function() {
    'use strict';

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('AccessClient');
        opts.user = {
            id:'myid',
            session:'123456',
            privateChannel:'/44C44933'
        };

        return opts;
    };

    describe('#instance', function() {
        var client = new AccessClient( createOptions()),
            methods = [
                'authenticate',
                'openAccessChannel',
                'openPrivateChannel',
                'wrapMessage',
                'sendPrivateMessage',
                'closeSockets',
                'accessMessageHandler',
                'privateMessageHandler',
                'createAuthMessage',
                'setUserAccessKey',
                'calculateDigest',
                'createHub'
            ];

        it('should create an instance of AccessClent', function() {
            should.exist( client );

            client.should.be.instanceof( AccessClient );
        });

        it( 'should contain all known methods based on method count and type', function() {
            dash.methods( client ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                client[ method ].should.be.a('function');
            });
        });
    });
});

