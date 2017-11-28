const crypto = require('crypto'),
    request = require('request'),
    moment = require('moment'),
    async = require('async'),
    _ = require('lodash'),
    log = require('../runtime/log'),
    logger = log.byJs(__filename),
    RequestDecorator = require('./RequestDecorator');

const config = require('../config'),
    yunpian = config.yunpian;

/*
YunpianDecorator.sendLoginCaptcha = function (mobile, callback) {
    var captcha = _.random(1000, 9999);
    YunpianDecorator.send(mobile, config.yunpian.templates.login.captcha, {
        captcha : captcha
    }, function(err) {
        callback(err, captcha);
    });
};*/

const send = function (mobile, template, templateSettings, callback) {
    if(!config.yunpian.enabled) {
        callback();
        return;
    }
    var message = _.template(template)(templateSettings);
    async.waterfall([
        function (callback) {
            request.post({
                url : 'https://sms.yunpian.com/v1/sms/send.json',
                headers: {
                    'Accept' : 'application/json',
                    'charset' : 'utf-8',
                    'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8'
                },
                form : {
                    apikey : config.yunpian.apiKey,
                    mobile: mobile,
                    text : message
                }
            }, callback);
        },
        function (res, body, callback) {
            var retJson = JSON.parse(body);
            var statusCode = retJson.code;
            var systime = moment().format('YYYYMMDDHHmmss');
            logger.info(`yunpian_login_captcha`, body);
            if (statusCode === 0) {
                
                //logger.YUNPIAN_LOG.info(systime + '_SUCCESS_' + mobile + ':' + message);
                //Succeed
                callback(null);
            } else {
                //logger.info(`yunpian_login_captcha`, body);
                //logger.YUNPIAN_LOG.info(systime + '_ERROR_' + mobile + ':' + retJson.detail);
                //Error
                callback(retJson.detail);
            }
        }
    ], callback);
};

module.exports = {
    send
};
