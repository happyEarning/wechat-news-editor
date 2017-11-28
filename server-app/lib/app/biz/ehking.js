const User = require('../../models/User'),
    Broker = require('../../models/Broker'),
    Customer = require('../../models/Customer'),
    config = require('../../config'),
    RequestDecorator = require('../../decorators/RequestDecorator'),
    validateLoginUserOrStaff = require('../validators/validateLoginUserOrStaff'),
    log = require('../../runtime/log'),
    logger = log.byJs(__filename);


module.exports.get = {
    method : 'get',
    middlewares : [
        //validateLoginUserOrStaff,
        (req, res, next) => {
            // let jointNumber;
            // if(req.$injection.user && req.$injection.user.ehking){
            //     jointNumber = req.$injection.user.ehking.jointNumber;
            // }else if(req.$injection.staff){
            //     jointNumber = req.query.jointNumber;
            // }
            // if(!jointNumber){
            //     next(new Error('参数不正确'));
            //     retrun;
            // }
            const url = config.ehking.url + config.ehking.queryJointaccount; //子账户查询
            const merchantId = config.ehking.merchantId;
            RequestDecorator.get(url,{
                merchantId:merchantId,
                jointNumber:req.query.jointNumber
            },(err, response, body)=>{
                const ehkingRes = JSON.parse(body);
                if(ehkingRes && ehkingRes.status && ehkingRes.status === 'SUCCESS'){
                    res.$locals.writeData({
                        user : ehkingRes
                    })
                    next();
                }else{
                    logger.info(`get`, ehkingRes);
                    next(new Error('子账户查询异常'))
                }
            })
        }
    ]
}

/*
module.exports.login = {
    method : 'post',
    middlewares : [
        validateSmsCaptcha,
        (req, res, next) => {
            Broker.findOne({
                mobile : req.body.mobile
            })
            .exec((err,broker)=>{
                if(broker){
                    req.$injection.broker = broker;
                    let user = req.$injection.user;
                    user.brokerRef = broker.id;
                    user.save(next);
                }else{
                    next();
                }
            })
        },
        (req, res, next) => {
            if(req.$injection.broker){
                //登录人是broker时跳过
                next();
            }else{
                Customer.findOne({
                    mobile : req.body.mobile
                })
                .exec((err,customer)=>{
                    if(customer){
                        req.$injection.customer = customer;
                        let user = req.$injection.user;
                        user.customerRef = customer.id;
                        user.save(next);
                    }else{
                        next();
                    }
                })
            }
        },
        (req, res, next) => {
            if(req.$injection.broker || req.$injection.customer){
                //登录人是broker时跳过
                User.findById(req.$injection.user.id)
                .populate('customerRef')
                .populate('brokerRef')
                .exec((err,user)=>{
                    res.$locals.writeData({user})
                    next();
                })
            }else{
                //mobile没有取得broker或customer时
                next(new Error('手机号不存在'))
            }
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
}*/
