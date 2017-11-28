const User = require('../../models/User'),
    config = require('../../config'),
    RequestDecorator = require('../../decorators/RequestDecorator'),
    validateLogin = require('../validators/validateLogin'),
    validateSmsCaptcha = require('../validators/validateSmsCaptcha');

module.exports.exist = {
    method : 'post',
    middlewares : [
        (req, res, next) => {
            const {telephone} = req.body;
            User.findOne({telephone}).exec((err, user) => {
                res.$locals.writeData({exist : !!user})
                next()
            });
        }
    ]
}

module.exports.login = {
    method : 'post',
    middlewares : [
        (req, res, next) => {
            const appId = config.wechat.appId;
            const secret = config.wechat.appSecret;
            
            RequestDecorator.get("https://api.weixin.qq.com/sns/oauth2/access_token", {
                'appid' : appId,
                'secret' : secret,
                'code' : req.body.code,
                'grant_type' : 'authorization_code'
            }, function (err, response, body) {
                if (err) {
                    next(err);
                } else {
                    body = JSON.parse(body);
                    //req.injection.access_token = body.access_token;
                    req.$injection.openid = body.openid;
                    next();
                }
            });
        },
        (req, res, next) => {
            User.findOne({
                openid : req.$injection.openid
            })
            .populate('BrokerRef')
            .populate('CustomerRef')
            .exec((err,user)=>{
                if(user){
                    res.$locals.writeData({user})
                    req.$session.setUser(user);
                    next();
                }else{
                    let user = new User({
                        openid : req.$injection.openid
                    })
                    user.save(err=>{
                        res.$locals.writeData({user})
                        req.$session.setUser(user);
                        next();
                    });
                }
            })
        }
    ]
}

module.exports.get = {
    method : 'get',
    middlewares : [
        (req, res, next) => {
            res.$locals.writeData({
                user : req.$injection.user
            })
            next();
        }
    ]
}

module.exports.logout = {
    method : 'post',
    middlewares : [
        (req, res, next) => {
            req.$session.clearUser();
            next();
        }
    ]
}
