/**
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/20/14
 */
var dash = require('lodash');

var MockMessageClient = function() {
    'use strict';

    var client = this,
        messageCallback;

    this.channel = null;

    this.subscribe = function(channel, callback) {
        client.channel = channel;
        console.log('subscribed to ', channel);
        messageCallback = callback;
    };

    this.then = function(callback) {
        if (callback) {
            dash.defer( callback, 'subscription accepted' );
        }
    };

    this.cancel = function() {
        client.channel = null;
    };

    this.publish = function(channel, message) {
        if (channel === client.channel && messageCallback) {
            dash.defer( messageCallback, message );
        }
    };
};

module.exports = MockMessageClient;