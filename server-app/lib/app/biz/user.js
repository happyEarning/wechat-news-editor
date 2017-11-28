const User = require('../../models/User'),
    Broker = require('../../models/Broker'),
    Customer = require('../../models/Customer'),
    config = require('../../config'),
    RequestDecorator = require('../../decorators/RequestDecorator'),
    validateLogin = require('../validators/validateLogin'),
    validateSmsCaptcha = require('../validators/validateSmsCaptcha');

/*
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
}*/

module.exports.login = {
    method : 'post',
    middlewares : [
        validateSmsCaptcha,
        (req, res, next) => {
            req.$injection.user.brokerRef = undefined;
            req.$injection.user.customerRef = undefined;
            next();
        },
        (req, res, next) => {
            Broker.findOne({
                mobile : req.body.mobile
            })
            .exec((err,broker)=>{
                if(broker){
                    req.$injection.broker = broker;
                    req.$injection.user.brokerRef = broker.id;
                }
                next();
            })
        },
        (req, res, next) => {
            Customer.findOne({
                mobile : req.body.mobile
            })
            .exec((err,customer)=>{
                if(customer){
                    req.$injection.customer = customer;
                    req.$injection.user.customerRef = customer.id;
                }
                next();
            })
        },
        (req, res, next) => {
            if(req.$injection.broker || req.$injection.customer){
                let user = req.$injection.user;
                user.save(err=>{
                    //登录人是broker时跳过
                    User.findById(req.$injection.user.id)
                    .populate('customerRef')
                    .populate('brokerRef')
                    .exec((err,user)=>{
                        res.$locals.writeData({user})
                        next();
                    })
                })
            }else{
                //mobile没有取得broker或customer时
                next(new Error('手机号不存在'))
            }
        }
    ]
}
/*
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
}*/

module.exports.logout = {
    method : 'post',
    middlewares : [
        (req, res, next) => {
            let user = req.$injection.user;
            if(user){
                user.customerRef = undefined;
                user.brokerRef = undefined;
                user.save(next);
            }else{
                next();
            }
        }
    ]
}
