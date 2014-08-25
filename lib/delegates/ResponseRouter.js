/**
 * @class ResponseRouter
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 8/25/14
 */
var dash = require('lodash');

var ResponseRouter = function(options) {
    'use strict';

    var router = this,
        log = options.log,
        dao = options.dao;

    // constructor validations
    if (!log) throw new Error('server must be constructed with a log');
    if (!dao) throw new Error('server must be constructed with a dao');
};

module.exports = ResponseRouter;
