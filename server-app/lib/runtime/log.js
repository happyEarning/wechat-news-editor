const _ = require('lodash'),
    winston = require('winston'),
    MongoDB = require('winston-mongodb').MongoDB,
    path = require('path');

const config = require('../config'),
    db = config.log.db;

const _baseOptions = {
    db : `mongodb://${db.user}:${db.password}@${db.url}:${db.port}/${db.schema}`,
    options : {
        poolSize : db.poolSize
    }
};

module.exports.init = function(next) {
    // Default logger
    winston.add(MongoDB, _baseOptions);

    // Exception logger
    new winston.Logger({
        exceptionHandlers : [
	        new MongoDB(_.extend(_baseOptions, {
	            collection : 'uncaught-exceptions'
	        })),
	        new winston.transports.Console({
                prettyPrint : true,
	            collection : 'uncaught-exceptions'
	        })
        ],
        exitOnError : false
    });

    next();
};

module.exports.byJs = function(js) {
    let category = path.relative(config.root, js);
    return byCategory(category);
};

const byCategory = module.exports.byCategory = function(category) {
    if (!winston.loggers.has(category)) {
	    winston.loggers.add(category, {
	        transports : [
	            new MongoDB(_.extend(_baseOptions, {
	                collection : category
	            })), 
	            new winston.transports.Console({
                    prettyPrint : true,
	                collection : category
	            })
	        ]
	    });
    }
    
    let logger = winston.loggers.get(category);
    return logger;
};
