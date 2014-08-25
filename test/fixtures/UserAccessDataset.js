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

    this.wrapRequestMessage = function(request, ssid) {
        var wrapper = {};

        wrapper.ts = Date.now();
        wrapper.version = '1.0';
        if (ssid) {
            wrapper.ssid = ssid;
        }
        wrapper.message = request;

        return wrapper;
    };

    this.createKnownUser = function() {
        var user = {};

        user.id = '87e13515b2a54f1aaee72d076bea7fb2';
        user.session = '71e8ad9c-a4f5-403f-a9bc-cce6318a01e2';
        user.hash = 'the-password-hash';

        return user;
    };
};

module.exports = UserAccessDataset;