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
    UserAccessDao = require('../../lib/dao/UserAccessDao');

describe('ResponseRouter', function() {
    'use strict';

    var dataset = new UserAccessDataset(),
        users = dataset.createUserList();

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('UserAccessDao');
        opts.users = users;

        return opts;
    };

    describe('#instance', function() {
        var dao = new UserAccessDao( createOptions()),
            methods = [
                'findUserById',
                'createSession'
            ];

        it('should create an instance of AccessService', function() {
            should.exist( dao );
            dao.should.be.instanceof( UserAccessDao );
        });

        it( 'should contain all known methods based on method count and type', function() {
            dash.methods( dao ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                dao[ method ].should.be.a('function');
            });
        });
    });
});
