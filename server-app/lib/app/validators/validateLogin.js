const async = require('async');

module.exports = (req, res, next) => {
    if (req.$injection.user) {
        next();
    } else {
        next(new Error('未登录'))
    }
}
