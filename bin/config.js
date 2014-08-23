/**
 * @author: darryl.west@raincitysoftware.com
 * @created: 2014-08-23
 */

module.exports.readMessageHubConfig = function() {
    'use strict';
    var config = {};

    config.port = 29170;
    config.hubName = '/Authentication';
    config.channels = [ '/access' ];

    config.daemon = true;

    // other security configurations...

    config.readLoggerConfig = function() {
        var opts = {
            logDirectory: process.env.HOME + '/logs',
            fileNamePattern:[ 'messages-', config.port, '-<DATE>.log' ].join(''),
            dateFormat:'YYYY.MM.DD',
            level:'info',
            loggerConfigFile: __dirname + '/logger-config.json',
            refresh:120 * 1000 // re-read the config json file each 120 seconds
        };

        return opts;
    };

    return config;
};

