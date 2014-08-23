/**
 * @class ApplicationFactory
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 2014-08-17
 */
var should = require('chai').should(),
    dash = require('lodash'),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    MessageService = require('../../lib/services/MessageService'),
    MessageSocketService = require('../../lib/services/MessageSocketService'),
    ApplicationFactory = require('../../lib/controllers/ApplicationFactory');

describe('ApplicationFactory', function() {
    'use strict';

    var createOptions = function() {
        var opts = {};

        opts.logManager = MockLogger;
        opts.port = 23442;
        opts.hubName = '/CustomHub';

        return opts;
    };

    describe('#instance', function() {
        var factory = new ApplicationFactory( createOptions()),
            methods = [
                'createMessageSocketService',
                'createMessageService',
                'createLogger',
                'createMessageClient',
                'initialize'
            ];

        it('should create an instance of ApplicationFactory', function() {
            should.exist( factory );
            factory.should.be.instanceof( ApplicationFactory );
        });

        it('should have all known methods by size', function() {
            dash.methods( factory ).length.should.equal( methods.length );

            methods.forEach(function(method) {
                factory[ method ].should.be.a('function');
            });
        });
    });

    describe('createMessageSocketService', function() {
        var factory = new ApplicationFactory( createOptions() );

        it('should create an instance of message socket service', function() {
            var service = factory.createMessageSocketService();

            should.exist( service );
            service.should.be.instanceof( MessageSocketService );
        });
    });

    describe('createMessageService', function() {

        it('should create an instance of message service', function() {
            var opts = createOptions(),
                factory = new ApplicationFactory( opts),
                channel = '/flarb',
                service = factory.createMessageService( channel );

            should.exist( service );
            service.should.be.instanceof( MessageService );
        });
    });
});

