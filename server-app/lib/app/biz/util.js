const _ = require('lodash'),
    async = require('async'),
    moment = require('moment'),
    multer = require('multer'),
    qiniu = require("qiniu"),
    fs = require('fs'),
    wechat = require('../../runtime/wechat'),
    config = require('../../config'),
    Broker = require('../../models/Broker'),
    GenericStatus = require('../../models/enum/GenericStatus'),
    yunpian = config.yunpian,
    YunpianDecorator = require('../../decorators/YunpianDecorator'),
    QiniuDecorator = require('../../decorators/QiniuDecorator');


module.exports.requestSmsCaptcha = {
    method : 'post',
    middlewares : [
        (req, res, next) => {
            const {mobile, purpose} = req.body,
                code = _.random(1000, 9999) + '';
            let templateId, params;
            if (purpose === 'login') {
                templateId = yunpian.templates.login.captcha;
                params = {captcha : code};
            } else if (purpose === 'register') {
                templateId = yunpian.templates.login.captcha;
                params = {captcha : code};
            }
            YunpianDecorator.send(mobile, templateId, params, (err) => {
                if (!err) {
                    req.$session.addSmsCaptcha(code, purpose, moment().add(5, 'minute').toDate().getTime())
                }
                next(err)
            })
        }
    ]
}
/*
module.exports.upload = {
    method : 'post',
    middlewares : [
        multer({dest: config.upload.dir}).any(),
        function(req, res, next) {
            async.parallel(req.files.map(file => {
                return next => {
                    QiniuDecorator.upload(file.path, config.qiniu.buckets.uploads, function(err, url) {
                        if (url) {
                            fs.unlink(file.path);
                            const data = {}
                            data[file.fieldname] = url;
                            res.$locals.writeData(data)
                        }
                        next(err);
                    })
                }
            }), next)
        }
    ]
};*/

module.exports.getProvinces = {
    'method': 'get',
    'middlewares': [
        (req, res, next) => {
            Broker.find({
                status:GenericStatus.NORMAL,
                isBroker:true,
                isDeleted:false
            })
            .exec((err,brokers)=>{
                let provinces = []
                brokers.map(broker=>{
                    if(broker.province){
                        provinces.push(broker.province)
                    }
                })
                const provincesSorted = _.uniq(provinces,true)
                res.$locals.writeData({provinces : provincesSorted});
                next();
            })
        }
    ]
};

module.exports.getCities = {
    'method': 'get',
    'middlewares': [
        (req, res, next) => {
            Broker.find({
                province:req.query.province,
                status:GenericStatus.NORMAL,
                isBroker:true,
                isDeleted:false
            })
            .exec((err,brokers)=>{
                let cities = []
                brokers.map(broker=>{
                    if(broker.city){
                        cities.push(broker.city)
                    }
                })
                const citiesSorted = _.uniq(cities,true)
                res.$locals.writeData({cities : citiesSorted});
                next();
            })
        }
    ]
};

module.exports.getDistricts = {
    'method': 'get',
    'middlewares': [
        (req, res, next) => {
            Broker.find({
                province:req.query.province,
                city:req.query.city,
                status:GenericStatus.NORMAL,
                isBroker:true,
                isDeleted:false
            })
            .exec((err,brokers)=>{
                let districts = []
                brokers.map(broker=>{
                    broker.districts.map(district=>{
                        if(district){
                            districts.push(district)
                        }
                    })
                })
                const districtsSorted = _.uniq(districts,true)
                res.$locals.writeData({districts : districtsSorted});
                next();
            })
        }
    ]
};

module.exports.getWechatJsConfig = {
    'method': 'get',
    'middlewares': [
        (req, res, next) => {
            wechat.api.getJsConfig({
                url : req.query.url
            }, function(err, config) {
                res.$locals.writeData({config});
                next();
            });
        }
    ]
};

module.exports.getUploadToken = {
    'method': 'get',
    'middlewares': [
        (req, res, next) => {
            var mac = new qiniu.auth.digest.Mac(config.qiniu.accessKey, config.qiniu.secretKey);
            var options = {
              scope: config.qiniu.scope,
            }
            var putPolicy = new qiniu.rs.PutPolicy(options);
            var uploadToken = putPolicy.uploadToken(mac);
            res.$locals.writeData({
                uploadToken:uploadToken,
                scope: config.qiniu.scope,
                baseUrl:config.qiniu.baseUrl
            });
            next();
        }
    ]
};