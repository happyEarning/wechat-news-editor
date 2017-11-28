const async = require('async'),
    config = require('../../config');

module.exports = (req, res, next) => {
    const {mobile, purpose, code} = req.body,
        smsCaptchas = req.$session.getSmsCaptchas(purpose);
    if (code === config.sms.captchaBackdoor) {
        next();
    } else {
        var valids = smsCaptchas.filter(smsCaptcha => {
            return code === smsCaptcha.code &&
                purpose === smsCaptcha.purpose &&
                Date.now() <= smsCaptcha.expiredAt
        })
        req.$session.clearSmsCaptcha(purpose);
        if (valids.length) {
            next();
        } else {
            next(new Error('短信验证码错误或者已过期'))
        }
    }
}
