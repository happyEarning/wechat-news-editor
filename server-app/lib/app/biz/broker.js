const Broker = require('../../models/Broker'),
    User = require('../../models/User'),
    config = require('../../config'),
    log = require('../../runtime/log'),
    logger = log.byJs(__filename),
    GenericStatus = require('../../models/enum/GenericStatus'),
    RequestDecorator = require('../../decorators/RequestDecorator'),
    WechatDecorator = require('../../decorators/WechatDecorator'),
    validateLogin = require('../validators/validateLogin'),
    validateLoginAsStaff = require('../validators/validateLoginAsStaff'),
    validateSmsCaptcha = require('../validators/validateSmsCaptcha'),
    WechatAPI = require('wechat-api');

_createJointaccount = (req,res, next) =>{
    let broker = req.$injection.broker;
    broker.failureReason = ''; //清空接口错误信息

    const url = config.ehking.url + config.ehking.createJointaccount; //创建子账户查询
    const merchantId = config.ehking.merchantId;
    const now = new Date();
    const requestId = now.getTime().toString();
    const param = {
        merchantId:merchantId,
        phone:broker.mobile,
        email:broker.ehking.email,
        name:broker.ehking.name,
        requestId:requestId,
    };
    logger.info(`createJointaccount_${broker.mobile}`,param);
    
    //创建子账号
    RequestDecorator.postForm(url,param,(err, response, body)=>{
        const ehkingRes = JSON.parse(body);
        if(ehkingRes && ehkingRes.status && ehkingRes.status === 'SUCCESS'){
            logger.info(`createJointaccount_SUCCESS_${broker.mobile}`,ehkingRes);

            broker.ehking.jointNumber = ehkingRes.jointNumber; 
            broker.ehking.qrcodeUrl = ehkingRes.qrcodeUrl;

            //创建子账号结算
            const settlementProfileUrl = config.ehking.url + config.ehking.jointSettlementProfile; 
            let settlementProfile = {
                merchantId:merchantId,
                jointNumber:broker.ehking.jointNumber,
                minAmount:2,
                bankAccountNo:broker.ehking.bankAccountNo,
                bankName:broker.ehking.bankName,
                name:broker.ehking.bankAccountName
            };
            logger.info(`jointSettlementProfile_${broker.mobile}`,settlementProfile);
            RequestDecorator.postForm(settlementProfileUrl,settlementProfile,(err, response, body)=>{
                const ehkingRes = JSON.parse(body);
                if(ehkingRes && ehkingRes.status && ehkingRes.status === 'SUCCESS'){

                    logger.info(`jointSettlementProfile_SUCCESS_${broker.mobile}`,ehkingRes);
                    broker.save(err=>{
                        req.$injection.broker = broker;
                        next();
                    })
                }else{
                    logger.info(`jointSettlementProfile_ERROR_${broker.mobile}`, ehkingRes);
                    broker.failureReason = '代理人子账号申请失败:'+ehkingRes.error;
                    broker.save(function(err){
                        next(new Error('代理人子账号申请失败:'+ehkingRes.error));
                        return;
                    });
                }
            })
        }else{
            logger.info(`createJointaccount_ERROR_${broker.mobile}`, ehkingRes);
            broker.failureReason = '代理人子账号申请失败:'+ehkingRes.error;
            broker.save(function(err){
                next(new Error('代理人子账号申请失败:'+ehkingRes.error));
                return;
            });
        }
    })
}

module.exports.createJointaccount = {
    method : 'post',
    middlewares : [
        validateLogin,
        (req, res, next) => {
            if(!req.$injection.user.brokerRef){
                next(new Error('未以代理人账号登录'));
                return;
            }
            if(!req.body.ehking.email){
                next(new Error('需要邮箱信息'));
                return;
            }
            if(!req.body.ehking.bankAccountNo){
                next(new Error('需要银行账号'));
                return;
            }
            if(!req.body.ehking.bankAccountName){
                next(new Error('需要银行账号卡人的名字'));
                return;
            }
            if(!req.body.ehking.bankName){
                next(new Error('需要银行名字'));
                return;
            }
            if(!req.body.ehking.name){
                next(new Error('需要易邻子账户名称'));
                return;
            }
            Broker.findById(req.$injection.user.brokerRef)
            .exec((err,broker)=>{
                if(broker){
                    broker.ehking = req.body.ehking;
                    req.$injection.broker = broker;
                    next();
                }else{
                    next(new Error('代理人不存在'));
                    return;
                }
            })
        },
        _createJointaccount,
        (req, res, next) => {
            res.$locals.writeData({broker:req.$injection.broker});
            next();
        }
    ]
}

module.exports.apply = {
    method : 'post',
    middlewares : [
        validateLogin,
        validateSmsCaptcha,
        (req, res, next) => {
            if(req.$injection.user.brokerRef){
                next(new Error('不能重复申请代理人'));
                return;
            }
            Broker.count({
                mobile:req.body.mobile
            })
            .exec((err,count)=>{
                if(count > 0){
                    next(new Error('输入的手机号已经存在!'));
                    return;
                }else{
                    next();
                }
            })
        },
        (req, res, next) => {
            let broker = new Broker({
                mobile: req.body.mobile,
                name: req.body.name,
                belongToRef: req.body.belongToRef,
                identity: req.body.identity,
                province: req.body.province,
                districts: req.body.districts,
                city: req.body.city,
                detail: req.body.detail,
                ehking: {
                    email:req.body.email,
                    bankAccountNo:req.body.bankAccountNo,
                    bankName:req.body.bankName,
                    bankAccountName:req.body.bankAccountName,
                    name:'真裁时料-' + req.body.name
                }
            })
            broker.save(err=>{
                req.$injection.brokerRef = broker.id;
                res.$locals.writeData({broker});
                next();
            });
        },
        (req, res, next) => {
            let user = req.$injection.user;
            user.brokerRef = req.$injection.brokerRef;
            user.save(next);
        }
    ]
}

module.exports.upsertSettlementProfile = {
    method : 'post',
    middlewares : [
        validateLogin,
        (req, res, next) => {
            const broker = req.$injection.user.brokerRef
            if(!broker || !broker.ehking || !broker.ehking.jointNumber){
                next(new Error('不是代理人或子账户不存在!'));
                return;
            }
            const url = config.ehking.url + config.ehking.jointSettlementProfile; //创建子账户查询
            const merchantId = config.ehking.merchantId;
            let settlementProfile = {
                merchantId:merchantId,
                jointNumber:broker.ehking.jointNumber,
                minAmount:2,
                bankAccountNo:req.body.bankAccountNo,
                bankName:req.body.bankName,
                name:req.body.name,
                bankAccountName:req.body.bankAccountName
            };
            logger.info(`jointSettlementProfile_${broker.mobile}`,settlementProfile);
            RequestDecorator.postForm(url,settlementProfile,(err, response, body)=>{
                const ehkingRes = JSON.parse(body);
                if(ehkingRes && ehkingRes.status && ehkingRes.status === 'SUCCESS'){
                    logger.info(`jointSettlementProfile_SUCCESS_${broker.mobile}`,ehkingRes);
                    req.$injection.ehking = ehkingRes;
                    next();
                }else{
                    logger.info(`jointSettlementProfile_ERROR_${broker.mobile}`, ehkingRes);
                    next(new Error('子账户结算创建修改异常'));
                    return;
                }
            })
        },
        (req, res, next) => {
            let broker = req.$injection.user.brokerRef;
            const ehking = req.$injection.ehking;
            broker.ehking.bankAccountNo = req.body.bankAccountNo;
            broker.ehking.bankName = req.body.branchBankName;
            broker.ehking.name = req.body.name;
            broker.save(next);
        }
    ]
}


module.exports.approve = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            Broker.findById(req.body.brokerRef)
            .exec(function(err,broker){
                req.$injection.broker = broker;
                if(broker.status && GenericStatus.NORMAL){
                    next(new Error('已审批通过，不能重复审批'));
                    return;
                }else{
                    next();
                }
                
            })
        },
        (req, res, next) => {
            if(parseInt(req.body.status) === GenericStatus.NORMAL){
                next();
                
            }else{
                broker = req.$injection.broker;
                broker.status = req.body.status;
                broker.approverRef = req.$injection.staff.id;
                broker.approveDate = new Date();
                broker.failureReason = '审核被拒绝';
                broker.save(function(err){
                    next();
                    return;
                });
                
            }
        },
        _createJointaccount,
        (req, res, next) => {
            //打代理人标签
            let broker = req.$injection.broker;
            User.findOne({
                brokerRef: broker.id  
            })
            .exec((err,user)=>{
                if(user){
                    WechatDecorator.userTagging(user.openid,103,(err,result)=>{
                        if(err){
                            broker.failureReason = JSON.stringify(result);
                            broker.save(function(err){
                                next(new Error(result.errmsg));
                            });
                        }else{

                            broker.status = req.body.status;
                            broker.approverRef = req.$injection.staff.id;
                            broker.approveDate = new Date();
                            broker.save(function(err){
                                res.$locals.writeData({broker});
                                next();
                            });
                        }
                    });
                }else{
                    next();
                }
            })
        }
    ]
}

module.exports.upgrade = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            Broker.findById(req.body.brokerRef)
            .exec((err,broker)=>{
                broker.failureReason = '';
                req.$injection.broker = broker;
                next();
            })
        },
        (req, res, next) => {
            User.findOne({
                brokerRef: req.body.brokerRef
            })
            .exec((err,user)=>{
                if(user){
                    broker = req.$injection.broker;
                    WechatDecorator.userTagging(user.openid,102,(err,result)=>{
                        if(err){
                            broker.failureReason = result;
                            broker.save(function(err){
                                next(new Error(result));
                            });
                        }else{
                            broker.belongToRef = undefined;
                            broker.isBroker =true;
                            broker.save(err=>{
                                res.$locals.writeData({broker});
                                next();
                            })
                        }
                    });
                }else{
                    next();
                }
            })
        }
    ]
}