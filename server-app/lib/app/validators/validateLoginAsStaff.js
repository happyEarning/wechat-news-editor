const async = require('async');

module.exports = (req, res, next) => {
    if (req.$injection.staff) {
        next();
    } else {
        next(new Error('未以管理员身份登录'))
    }
}
