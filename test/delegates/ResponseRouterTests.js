/**
 * @class ResponseRouterTests
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/25/14
 */
var should = require('chai').should(),
    dash = require('lodash'),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    UserAccessDataset = require('../fixtures/UserAccessDataset'),
    UserAccessDao = require('../../lib/dao/UserAccessDao'),
    ResponseRouter = require('../../lib/delegates/ResponseRouter');

describe('ResponseRouter', function() {
    'use strict';

    var dataset = new UserAccessDataset(),
        users = dataset.createUserList();

    var createUserAccessDao = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('UserAccessDao');
        opts.users = users;

        return new UserAccessDao( opts );
    };

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('ResponseRouter');
        opts.dao = createUserAccessDao();

        return opts;
    };

    describe('#instance', function() {
        var router = new ResponseRouter( createOptions()),
            methods = [
                'routeMessage',
                'authenticate',
                'createSession'
            ];

        it('should create an instance of ResponseRouter', function() {
            should.exist( router );
            router.should.be.instanceof( ResponseRouter );
        });

        it( 'should contain all known methods based on method count and type', function() {
            dash.methods( router ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                router[ method ].should.be.a('function');
            });
        });
    });
});
