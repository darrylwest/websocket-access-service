/**
 * RemoteLogger - log to a remote end point
 * created: 2011.06.28
 *
 * @version 2011.07.08-807  - original
 * @version 2012.02.27-4560 - moved levels before category
 * @version 2012.08.16-8909 - added send interface for remote implementation
 * @version 2012.09.29-9479 - refactor for LabLib tests
 * @version 2013.01.02-11621 - refactor common methods to prototype
 * @version 2013.03.31-14024 - refactor to work with node
 * @version 2013.05.16-14453 - added warn console log
 *
 * levels debug:0, info:1, warn:2, error:3
 *
 * USE: var log = RemoteLogger.createLogger( 'CategoryName' );
 *
 * CategoryName is usually the class name
 *
 * Dependencies:
 * 	console.log (unless overridden)
 * 	unique.js for session UUID
 *
 */

// for window-less server applications
if (typeof(window) !== 'undefined') {
    // IE workaround
    if (typeof(window["console"]) === "undefined") {
        console = {};
        console.log = function() {};
        console.warn = function() {};
    } else {
        if (typeof console.warn === "undefined") {
            console.warn = console.log;
        }
    }
}

var RemoteLogger = function(category, level) {
    var logger = this;

    this.getCategory = function() {
        return category;
    };

    // public to enable changing at runtime
    this.level = (level === undefined) ? 1 : level;

    // public instance to enable instance override
    this.log = function(level, obj) {
        var msg = [ RemoteLogger.id++, new Date().getTime(), level, category, obj ];

        logger.logToOutput( msg );

        if (typeof logger.send === 'function') {
            logger.send( msg );
        }
    };
};

RemoteLogger.VERSION = '2013.05.16-14453';

/**
 * override this at the application level
 *
 * @param msg
 */
RemoteLogger.prototype.send;

RemoteLogger.prototype.logToOutput = function(msg) {
    switch (msg[2]) {
        case 'WARN':
        case 'ERROR':
            console.warn( msg.join(' ') );
            break;
        default:
            console.log( msg.join(' ') );
            break;
    }

};

RemoteLogger.prototype.isDebug = function() {
    return (this.level === 0);
};

RemoteLogger.prototype.debug = function(obj) {
    if (this.level === 0) {
        this.log( 'debug', Array.prototype.slice.call( arguments ).join('') );
    }
};

RemoteLogger.prototype.info = function() {
    if (this.level <= 1) {
        this.log( 'INFO', Array.prototype.slice.call( arguments ).join('') );
    }
};

RemoteLogger.prototype.warn = function(obj) {
    if (this.level <= 2) {
        this.log( 'WARN', Array.prototype.slice.call( arguments ).join('') );
    }
};

RemoteLogger.prototype.error = function(obj) {
    if (this.level <= 3) {
        this.log( 'ERROR', Array.prototype.slice.call( arguments ).join('') );
    }
};

RemoteLogger.prototype.assert = function(bool, text) {
    if (!bool) {
        this.log( 'ASSERT', text );
    }
};

// Constants
RemoteLogger.DEBUG = 0;
RemoteLogger.INFO = 1;
RemoteLogger.WARN = 2;
RemoteLogger.ERROR = 3;

// psuedo-static vars
RemoteLogger.id = 100;
RemoteLogger.loggers = [];

/**
 * factory constructor
 */
RemoteLogger.createLogger = function(category, level) {
    if (!category) {
        category = 'Unknown-' + RemoteLogger.loggers.length;
    }

    // public to enable changing at runtime
    var level = (level === undefined) ? 1 : level;

    var log = new RemoteLogger( category, level );
    RemoteLogger.loggers.push( log );

    return log;
};

/**
 * set the level of specified array of loggers, or if null to all loggers
 */
RemoteLogger.setLevels = function(level, loggers) {
    if (typeof loggers === "undefined") loggers = RemoteLogger.loggers;

    loggers.forEach(function(logger) {
        logger.level = level;
    });
};

RemoteLogger.createSession = function(appName, appVersion) {
    var session = {
        ssid:UUID.create(),
        appName:appName,
        appVersion:appVersion,
        startDate:new Date().getTime(),
        userAgent:navigator.userAgent,
        platform:navigator.platform,
        host:location.host,
        href:location.href,
        origin:location.origin
    };

    return session;
};
