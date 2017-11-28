const express = require('express'),
    async = require('async'),
    _ = require('lodash')

const config = require('../config'),
    db = require('../runtime/db')
    log = require('../runtime/log');

module.exports.bootstrap = (next) => {
    const app = express();

    _vendorMiddlewares(app);
    _appMiddlewares(app);
    _biz(app);
    _rest(app);
    _errHandler(app);
    // Listen
    app.listen(config.app.port);

    next();
}

const _vendorMiddlewares = app => {
    const cors = require('cors'),
        connect = require('connect'),
        cookieParser = require('cookie-parser'),
        session = require('express-session'),
        MongoStore = require('connect-mongo')(session),
        // sessionMongoose = require('session-mongoose'),
        bodyParser = require('body-parser'),
        responseTime = require('response-time'),
        methodOverride = require('method-override');

    // Log response time
    app.use(responseTime());
    // Cross domain
    app.use(cors({
        origin : true,
        credentials : true
    }));
    // Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
    app.use(methodOverride());
    // Cookie parser
    app.use(cookieParser(config.app.cookieSecret));
    // Session
    app.use(session({
        secret: config.app.sessionSecret,
        cookie : {
            maxAge : 14 * 24 * 60 * 60 * 1000
        },
        resave : false,
        saveUninitialized : false,
        store: new MongoStore({
            url: db.url,
            ttl: 14 * 24 * 60 * 60 // = 14 days. Default
        })
    }));
    // Body parser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended : true
    }));
}

const _appMiddlewares = app => {
    // inject accessors
    const SessionAccessor = require('./accessors/SessionAccessor'),
        LocalsAccessor = require('./accessors/LocalsAccessor'),
        logger = log.byCategory('api-trace');
    app.use((req, res, next) => {
        // Log
        logger.info(req.url, {
            headers : req.headers,
            query : req.query,
            body : req.body,
            ip : req.header('X-Real-IP') || req.connection.remoteAddress,
        })
        next();
    });
    app.use((req, res, next) => {
        // Prepare output
        req.$injection = {};
        req.session = req.session || {};
        req.$session = new SessionAccessor(req.session)
        res.locals = {}
        res.$locals = new LocalsAccessor(res.locals)
        next();
    });
    // injectLoginInfo
    app.use(require('./injectors/injectLoginInfo'))
}

const _biz = app => {
    const router = express.Router();
    const biz = require('./biz');

    const output = (req, res) => {
        res.json(res.$locals.getData());
    }
    for (let categoryName in biz) {
        const category = biz[categoryName];
        for (let apiName in category) {
            const api = category[apiName];
            router[api.method](`/${categoryName}/${apiName}`, api.middlewares, api.output || output);
        }
    };

    app.use('/services/biz', router)
}

const _rest = app => {
    const restify = require('express-restify-mongoose');

    const router = express.Router();
    restify.defaults({
        prefix : '/rest',
        version : '',
        // Whether to use .findOneAndUpdate() or .findById() and then .save(), allowing document middleware to be called. For more information regarding mongoose middleware, read the docs.
        findOneAndUpdate : false,
        findOneAndRemove : false
    });

    const rest = require('./rest');
    for (var categoryName in rest) {
        var category = rest[categoryName];
        category.options = category.options || {};
        category.options.name = category.options.name || categoryName;
        restify.serve(router, category.model, category.options);
    };
    app.use('/services', router)
}

const _errHandler = (app) => {
    app.use((err, req, res, next) => {
        const json = {message : err.message}
        if (err instanceof Error) {
            json.message = err.message
            json.stacks = err.stack.split('\n')
        } else {
            json.message = err;
        }
        res.json({err : json});
    })
}

