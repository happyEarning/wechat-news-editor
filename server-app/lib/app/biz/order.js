const Broker = require('../../models/Broker'),
    Order = require('../../models/Order'),
    Payment = require('../../models/Payment'),
    config = require('../../config'),
    mail = config.mail,
    download = config.download,
    Fs = require('fs'),
    Path = require('path'),
    Excel = require('exceljs'),
    Moment = require('moment'),
    _ = require('lodash'),
    log = require('../../runtime/log'),
    logger = log.byJs(__filename),
    Nodemailer = require('nodemailer'),
    RequestDecorator = require('../../decorators/RequestDecorator'),
    validateLoginAsStaff = require('../validators/validateLoginAsStaff'),
    validateLoginUserOrStaff = require('../validators/validateLoginUserOrStaff'),
    ShirtExcelDecorator = require('../../decorators/ShirtExcelDecorator'),
    WechatAPI = require('wechat-api');





_findOrderById = (orderRef,next) => {
    Order.findById(orderRef)
        .populate('createrRef')
        .populate('customerRef')
        .populate('brokerRef')
        .populate('approverRef')
        .populate('sizeRef')
        .populate('liangTi.sizeRef')
        .populate('luTaiMianLiaoRef')
        .populate('peiSeMianLiaoRef')
        .populate('paymentRefs')
        .populate('transferResults')
        .exec(function(err,order){
            next(order);
        })
}

_findOrders = (condititon,next) => {
    Order.find(condititon)
        .populate('createrRef')
        .populate('customerRef')
        .populate('brokerRef')
        .populate('agentRef')
        .populate('sizeRef')
        .populate('approverRef')
        .populate('liangTi.sizeRef')
        .populate('luTaiMianLiaoRef')
        .populate('peiSeMianLiaoRef')
        .populate('paymentRefs')
        .populate('transferResults')
        .exec(function(err,orders){
            next(orders);
        })
}

_createDownloadFile = (orders,filename, next) =>{
    let workbook = new Excel.Workbook();
    let sheet = workbook.addWorksheet('预约单');
    sheet.columns = [
        { header: '预约单编号', key: 'no', width: 10 },
        { header: '预约日期', key: 'date', width: 10 },
        { header: '客户', key: 'customer', width: 10 },
        { header: '合伙人、代理人', key: 'broker', width: 20 },
        { header: '定制内容', key: 'item', width: 20 },
        { header: '数量', key: 'num', width: 10 },
        { header: '工厂', key: 'factory', width: 40 },
        { header: '审批人', key: 'customer', width: 10 },
    ];
    const rows = orders.map(function(order){
        return [
            order.no,
            order.date,
            order.customerRef?order.customerRef.name:'',
            order.brokerRef?order.brokerRef.name:'',
            order.item,
            order.num,
            order.factoryRef?order.factoryRef.name:'',
            order.approverRef?order.approverRef.name:''];
    })
    sheet.addRows(rows);
    workbook.xlsx.writeFile(filename)
    .then(next); 
}

_sendMail = (file, next)=>{
    let transporter = Nodemailer.createTransport({
        host: mail.host,
        port: mail.port,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: {
            user: mail.authUser,
            pass: mail.password
        }
    });
    let mailOptions = {
        from: mail.mailFrom, // sender address
        to: mail.mailTo, // list of receivers
        subject: mail.subject, // Subject line
        text: mail.textContent, // plain text body
        html: mail.htmlContent, // html body
        attachments: [
            {
                filename: 'e:/text.xlsx',
                content: 'test'
            },
            {
                filename: 'e:/text.xlsx',
                content: 'test2'
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            next(error);
        }else{
            next();
        }
    });
}

_jointTransferOrderCreate = (req,broker, next) =>{
    let order = req.$injection.order;
    let transfered = false;
    if(order.transferResults && order.transferResults.length > 0){
        order.transferResults.map(transferResult=>{
            if(transferResult.brokerRef === broker.id){
                transfered = true;
            }
        })
    }
    if(!broker || transfered){
        //无代理人合伙人或已转过账
        next();
    }else{
        const url = config.ehking.url + config.ehking.jointTransferOrderCreate; //转账
        const merchantId = config.ehking.merchantId;
        const now = new Date();
        let transfer = {
            merchantId:merchantId,
            jointNumber:broker.ehking.jointNumber,
            amount:req.$injection.orderAmount,
            requestId:now.getTime().toString()
        };
        logger.info(`jointTransferOrderCreate_${broker.mobile}`,transfer);
        RequestDecorator.postForm(url,transfer,(err, response, body)=>{
            const ehkingRes = JSON.parse(body);
            if(ehkingRes && ehkingRes.status && ehkingRes.status === 'SUCCESS'){

                logger.info(`jointTransferOrderCreate_SUCCESS_${broker.mobile}`,ehkingRes);
                const transferResult = {
                    brokerRef : broker.id,
                    requestId:transfer.requestId,
                    serialNumber:ehkingRes.serialNumber,
                    jointNumber:broker.ehking.jointNumber,
                    amount:transfer.amount
                }
                order.transferResults.push(transferResult);
                req.$injection.order = order;
                next();
            }else{
                logger.info(`jointTransferOrderCreate_ERROR_${broker.mobile}`, ehkingRes);
                let ehkingErr = ehkingRes.error;
                if(ehkingErr.indexOf('amount.insufficient') > 0){
                    ehkingErr = '主账户余额不足';
                }
                order.transferFailure = ehkingErr;
                order.save(err=>{
                    next(new Error('向子账号转账失败:'+ehkingErr));
                })
            }
        })
    }
}


module.exports.add = {
    method : 'post',
    middlewares : [
        validateLoginUserOrStaff,
        (req, res, next) => {
            //一键复购处理
            if(req.body.customerRef){
                Order.findOne({
                    customerRef:req.body.customerRef
                })
                .sort({date:-1})
                .exec((err,order)=>{
                    if(order){
                        req.$injection.oldOrder = order;
                        next();
                    }else{
                        next(new Error('还没有购买过商品'));
                        return;
                    }
                })
            }else if(req.body.orderRef){
                Order.findById(req.body.orderRef)
                .exec((err,order)=>{
                    if(order){
                        req.$injection.oldOrder = order;
                        next();
                    }else{
                        next(new Error('指定的订单不存在'));
                        return;
                    }
                })
            }else{
                next();
            }
        },
        (req, res, next) => {
            //预约单分配处理
            if(req.body.order){
                let order = req.body.order;
                if(req.$injection.staff){
                    //预约单创建人
                    order.createrRef = req.$injection.staff.id;
                    order.status = Order.ASSIGNED;
                    req.$injection.order = order;
                    next();
                }else{
                    //根据客户所属地自动分配合伙人
                    const province = order.liangTi.address.province;
                    const city = order.liangTi.address.city;
                    const district = order.liangTi.address.district;
                    let condititon = {
                        province:province,
                        city:city,
                        isBroker:true,
                        isDeleted:false
                    }
                    if(province.indexOf('北京') === 0 || province.indexOf('上海') === 0 ||
                        province.indexOf('广州') === 0 || province.indexOf('深圳') === 0 ){
                        condititon.districts = district
                    }
                    if(province && city){
                        Broker.find(condititon)
                        .sort({assignedDate : 1})
                        .exec((err,brokers)=>{
                            if(brokers.length > 0){
                                order.brokerRef = brokers[0]._id;
                                order.status = Order.ASSIGNED
                                req.$injection.order = order;
                                brokers[0].assignedDate = new Date();
                                brokers[0].save(next);
                            }else{
                                next()
                            }
                        })
                    }else{
                        next();
                    }
                }
            }else{
                next();
            }
            
        },
        (req, res, next) => {
            let order;
            if(req.$injection.oldOrder){
                const oldOrder = req.$injection.oldOrder;
                order = new Order({
                    //status: Order.ASSIGNED,
                    customerRef: oldOrder.customerRef,
                    brokerRef: oldOrder.brokerRef,
                    agentRef: oldOrder.agentRef,
                    num: oldOrder.num,
                    item: oldOrder.item,
                    liangTi: oldOrder.liangTi,
                    luTaiMianLiaoRef: oldOrder.luTaiMianLiaoRef,
                    keGongMianLiao: oldOrder.keGongMianLiao,
                    peiSeMianLiaoRef: oldOrder.peiSeMianLiaoRef,
                    peiSeBuWei: oldOrder.peiSeBuWei,
                    receiveAddress: oldOrder.receiveAddress
                })
            }else{
                order = new Order(req.$injection.order);
            }
            // if(order.paymentDate){
            //     order.status = Order.PAID;
            // }
            order.save(function(err){
                if(err){
                    next(err);
                }else{
                    _findOrderById(order.id,function(order){
                        res.$locals.writeData(order);
                        next();
                    });
                }
            })
        },
        (req, res, next) => {
            let user = req.$injection.user;
            const order = req.$injection.order;
            if(order && user && !user.customerRef){
                user.customerRef = order.customerRef;
                user.save(next);
            }else{
                next();
            }
        }   
    ]
}

module.exports.approve = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            Order.findById(req.body.orderRef)
            .exec(function(err,order){
                order.status = req.body.status;
                order.approverRef = req.$injection.staff.id;
                order.approveDate = new Date();
                order.save(function(err){
                    _findOrderById(order.id,function(order){
                        res.$locals.writeData(order);
                        next();
                    });
                });
            })
        }
    ]
}

module.exports.send = {
    method : 'post',
    middlewares : [
        //validateLoginAsStaff,
        (req, res, next) => {
            _sendMail('',function(err){
                if(err){
                    next(err);
                    return;
                }else{
                    next();
                }
            })
        }
    ]
}

module.exports.export = {
    method : 'get',
    middlewares : [
        //validateLoginAsStaff,
        (req, res, next) => {
            Order.findById( req.query.orderRef)
            .populate('createrRef')
            .populate('customerRef')
            .populate('brokerRef')
            .populate('agentRef')
            .populate('liangTi.sizeRef')
            .populate('approverRef')
            .populate('liangTi.sizeRef')
            .populate('luTaiMianLiaoRef')
            .populate('peiSeMianLiaoRef')
            .exec((err,order)=>{
                if(order){
                    let templateFilePath;
                    if(order.item == '男衬衫'){
                        templateFilePath = config.attachmentTemplete.shirtMan;
                    }else{
                        templateFilePath = config.attachmentTemplete.shirtWomen;
                    }
                    let workbook = new Excel.Workbook();
                    workbook.xlsx.readFile(templateFilePath)
                    .then(function() {
                        const file = config.download.tmpDir + order.no + '.xlsx';
                        
                        let ordersheet = workbook.getWorksheet('下单表');
                        let sizesheet = workbook.getWorksheet('号衣尺寸');
                        //var xlsx = XLSX.readFile(templateFilePath,{raw:true,cellStyles:true});
                        //XLSX.writeFile(xlsx,  config.download.tmpDir +'test.xlsx'); 
                        ShirtExcelDecorator.fillShirtExcel(ordersheet,order);
                        
                        if(order.item == '男衬衫'){
                            workbook.views[0].activeTab = 0;
                        }
                        
                        workbook.xlsx.writeFile(file)
                        .then(err=>{
                            res.$locals.file = file;
                            if(order.downloadCnt){
                                order.downloadCnt++;    
                            }else{
                                order.downloadCnt = 1;
                            }
                            order.save(next);
                        });
                    });
                }else{
                    next (new Error('指定预约单不存在'))
                    return 
                }
            })
        }
    ],
    output : (req, res) => {
        //const file = req.$locals.file;
        res.on('finish', function() {
            Fs.unlink(res.$locals.file);
        })
        res.download(res.$locals.file, Path.parse(res.$locals.file).base);
    }
}

module.exports.transfer = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            Order.findById(req.body.orderRef)
            .populate('brokerRef')
            .populate('agentRef')
            //.populate({path:'paymentRefs',model:'Payment'})
            .populate('paymentRefs')
            .exec((err,order) => {
                if(!order.paymentRefs || order.paymentRefs.length <= 0){
                    next(new Error('还没有交易记录'))
                    return;
                }
                if(!order.brokerRef && !order.agentRef){
                    next(new Error('没有合伙人代理人，不能结算'))
                    return;
                }
                //订单金额计算
                let orderAmount = 0;
                order.paymentRefs.map(paymentRef=>{
                    orderAmount += paymentRef.ehking.amount * 10;  //按10%计算
                })
                //取整数到分单位
                orderAmount = parseInt(orderAmount);
                if(orderAmount <= 0){
                    next(new Error('转账金额不足1分'));
                    return;
                }
                //清空转账报错
                order.transferFailure = '';
                req.$injection.orderAmount = orderAmount; 
                req.$injection.order = order;
                next();
            })
        },
        (req, res, next) => {
            let order = req.$injection.order;
            const broker = order.brokerRef;
            _jointTransferOrderCreate(req,broker,err=>{
                if(err){
                    next(err);
                    return;
                }else{
                    next();
                }
            });
        },
        (req, res, next) => {
            let order = req.$injection.order;
            const broker = order.agentRef;
            _jointTransferOrderCreate(req,broker,err=>{
                if(err){
                    next(err);
                    return;
                }else{
                    next();
                }
            });
        },
        (req, res, next) => {
            let order = req.$injection.order;
            order.save(err=>{
                _findOrderById(order.id,order=>{
                    res.$locals.writeData({order});
                    next();
                })
            })
        }
    ]
}


module.exports.onlinepay = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            if(!req.body.paymentModeCode || 
                (req.body.paymentModeCode !== 'SCANCODE-WEIXIN_PAY-P2P' &&
                req.body.paymentModeCode !== 'SCANCODE-ALI_PAY-P2P')){
                next(new Error('扫码支付方式不正确'));
                return;
            }
            Order.findById(req.body.orderRef)
            .exec((err,order) => {
                if(order){
                    if(order.amount <= 0){
                        next(new Error('订单金额必须大于0'));
                        return;
                    } 
                    req.$injection.order = order;
                    next();
                }else{
                    next(new Error('订单不存在'));
                    return;
                }
            })
        },
        (req, res, next) => {
            //生成requestId
            const now = new Date();
            const requestId = now.getTime().toString();
            //取得clientIp
            let clientIp = req.header('X-Real-IP') || req.connection.remoteAddress;
            if(clientIp === '::1' || clientIp ==='::ffff:127.0.0.1'){
                clientIp = '139.196.137.125'
            }
            const notifyUrl = config.onlinepay.notifyUrl;
            
            const order = req.$injection.order;
            const param = {
                requestId:requestId,
                orderAmount:order.amount * 100, //分为单位
                notifyUrl:notifyUrl,
                callbackUrl:notifyUrl,
                clientIp:clientIp,
                paymentModeCode:req.body.paymentModeCode,
                hiddenPD:JSON.stringify([{
                    name:order.item,
                    amount:order.amount * 100, //分为单位
                    quantity:order.num,
                }])
            }
            const payment = new Payment({
                requestId:requestId,
                orderRef:order.id,
                onlinepay:param
            });
            req.$injection.payment = payment;
            req.$injection.param = param;
            next();
        },
        (req, res, next) => {
            const order = req.$injection.order;
            const url = config.onlinepay.url + config.onlinepay.order; //支付
            
            const param = req.$injection.param;
            logger.info(`onlinepay_orderno:${order.no}`,param);
            RequestDecorator.postForm(url,param,(err, response, body)=>{
                const res = JSON.parse(body);
                if(res && res.status === 'SUCCESS'){
                    req.$injection.payment.onlinepay.resRaw = res;
                    req.$injection.payment.onlinepay.scanCode = res.scanCode;
                    next();
                }else{
                    logger.info(`onlinepay_orderno:${order.no}_error`,res);
                    next(new Error('取得支付扫码失败。'));
                    return
                }
            })
        },
        (req, res, next) => {
            let order = req.$injection.order;
            let payment = req.$injection.payment;
            payment.orderRef = order.id;
            payment.save(err=>{
                res.$locals.writeData({
                    scanCode:payment.onlinepay.scanCode
                });
                next();
                /*
                let order = req.$injection.order;
                order.paymentRefs.push(payment.id);
                order.isOnlinepay = true;
                order.save(err=>{
                    res.$locals.writeData({
                        scanCode:payment.onlinepay.scanCode
                    });
                    next();
                });*/
            })
        }
    ]
}


