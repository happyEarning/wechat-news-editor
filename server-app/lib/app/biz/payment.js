const User = require('../../models/User'),
    Broker = require('../../models/Broker'),
    Customer = require('../../models/Customer'),
    Payment = require('../../models/Payment'),
    Order = require('../../models/Order'),
    config = require('../../config'),
    log = require('../../runtime/log'),
    request = require('request'),
    logger = log.byJs(__filename);

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
module.exports.onlinePayGateway = {
  method: 'post',
  middlewares: [
  ],
  output: (req, res) => {
    logger.info(`onlinePayGateway`, req.body);
    let url;

    Payment.findOne({
        requestId:req.body.requestId
    })
    .exec((err,payment)=>{
        if(payment){
            url = 'http://tailor.apeec.vip/services/biz/payment/onlinePayCallback';
        }else{
            url = 'http://tailor-dev.apeec.vip/services/biz/payment/onlinePayCallback';
        }
        request.post({
          url: url,
          form: req.body
        }, function (err, remoteResponse, remoteBody) {
          if (err) { return res.status(500).end('Error') }
          res.end(remoteBody)
        })
    })
  }
}

module.exports.onlinePayCallback = {
    method : 'post',
    middlewares : [
        (req, res, next) => {
            logger.info(`onlinePayCallback`, req.body);
            Payment.findOne({
                requestId:req.body.requestId
            })
            .exec((err,payment)=>{
                if(payment){
                    payment.raw = req.body;
                    payment.onlinepay.status = req.body.status;
                    payment.save(err=>{
                        req.$injection.payment = payment;
                        next();
                    });

                }else{
                    logger.info(`onlinePayCallback_requestId_not_found:${req.body.requestId}`, req.body);
                    next();
                    return;
                }
            })
        },
        (req, res, next) => {
            if(req.body.status === 'SUCCESS'){
                const payment = req.$injection.payment;
                Order.findById(payment.orderRef)
                .exec((err,order)=>{
                    if(order){
                        order.paymentRefs.push(payment.id);
                        order.isOnlinepay = true;
                        order.status = Order.PAID;
                        order.paymentDate = new Date();
                        order.save(next);
                    }else{
                        logger.info(`onlinePayCallback_order_not_found_by_payment:${payment.id}`, req.body);
                        next();
                    }
                })
            }else{
                next();
            }
        }
    ],
    output: (req, res) => {
        res.send('success')
    }
}

module.exports.ehkingGateway = {
  method: 'post',
  middlewares: [
  ],
  output: (req, res) => {
    logger.info(`ehkingGateway`, req.body);
    let url;
    Broker.findOne({
        'ehking.jointNumber':req.body.code
    })
    .exec((err,broker)=>{
        if(broker){
            url = 'http://tailor.apeec.vip/services/biz/payment/ehkingCallback';
        }else{
            url = 'http://tailor-dev.apeec.vip/services/biz/payment/ehkingCallback';
        }
        request.post({
          url: url,
          form: req.body
        }, function (err, remoteResponse, remoteBody) {
          if (err) { return res.status(500).end('Error') }
          res.end(remoteBody)
        })
    })
  }
}

module.exports.ehkingCallback = {
    method : 'post',
    middlewares : [
        (req, res, next) => {
            Broker.findOne({
                'ehking.jointNumber':req.body.code
            })
            .exec((err,broker)=>{
                if(broker){
                    req.$injection.broker = broker;
                    next();
                }else{
                    logger.info(`ehkingCallback_Can not find broker`, req.body);
                    next();
                }
            })
        },
        (req, res, next) => {
            let payment = new Payment({
                ehking:{
                    amount:req.body.amount,
                    checkAccountNumber:req.body.checkAccountNumber, //对账码
                    paymentMode:req.body.paymentMode,
                    requestId:req.body.requestId,
                    status:req.body.status,
                    tradeStatus:req.body.tradeStatus,
                    createDateTime:new Date(req.body.createDateTime),
                    completeDateTime:new Date(req.body.completeDateTime),
                    jointNumber:req.body.code
                },
                raw:req.body
            })
            if(req.$injection.broker){
                payment.brokerRef = req.$injection.broker.id;
            }
            payment.save(next);
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
