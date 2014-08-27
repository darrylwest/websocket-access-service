/**
 * @class UserAccessDaoTests
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/24/14
 */
var should = require('chai').should(),
    dash = require('lodash'),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    UserAccessDataset = require('../fixtures/UserAccessDataset'),
    UserAccessDao = require('../../lib/dao/UserAccessDao');

describe('UserAccessDao', function() {
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
                'authenticate'
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

    describe('findUserById', function() {
        var dao = new UserAccessDao( createOptions() );

        it('should find known users', function(done) {
            var id = users[3].id;

            var callback = function(err, user) {
                should.not.exist( err );
                should.exist( user );

                user.id.should.equal( id );

                done();
            };

            dao.findUserById( id, callback );
        });
    });
});
