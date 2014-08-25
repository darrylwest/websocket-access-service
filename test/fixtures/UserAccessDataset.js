/**
 *
 * @author: darryl.west@roundpeg.com
 * @created: 8/25/14
 */
var dash = require('lodash'),
    casual = require('casual'),
    uuid = require('node-uuid');

var UserAccessDataset = function() {
    'use strict';

    var dataset = this;

    this.createId = function() {
        return uuid.v4().replace( /-/g, '' );
    };

    this.createUser = function() {
        var user = {
            id:dataset.createId(),
            name:casual.name,
            session:'',
            hash:''
        };

        return user;
    };

    this.createUserList = function(count) {
        var users = [];

        if (!count) count = 10;

        while (count-- > 0) {
            users.push( dataset.createUser() );
        }

        return users;
    };
};

module.exports = UserAccessDataset;