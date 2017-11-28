var WechatAPI = require('wechat-api');

var config = require('../config');

module.exports.init = function(next) {
    var api = module.exports.api = new WechatAPI(config.wechat.appId, config.wechat.appSecret);
    next();
};
