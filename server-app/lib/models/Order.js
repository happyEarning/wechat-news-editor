
var mongoose = require('mongoose'),
    moment = require('moment'),
    methods = require('./methods'),
    Schema = mongoose.Schema;

const async = require('async');

const jingChiCun = {
    shenGao:Number,
    tiZhong:Number,
    lingWei:Number,
    xiongWei:Number,
    yaoWei:Number,
    duWei:Number,
    diBian:Number,
    houYiChang:Number,
    jianKuan:Number,
    changXiuChang:Number,
    zuoWanWei:Number,
    youWanWei:Number,
    xiuFei:Number,
    xiaoTunWei:Number,
    qianShenChang:Number,
    qianXiongKuan:Number,
    houBeiKuan:Number,
    duanXiuChang:Number,
    duanXiuKou:Number,
    haoYiChiMa:String,
    keGongMianLiaoKuaiDiDanHao:String
}

const chengYiChiCun = {
    shenGao:Number,
    tiZhong:Number,
    lingWei:Number,
    xiongWei:Number,
    yaoWei:Number,
    duWei:Number,
    diBian:Number,
    houYiChang:Number,
    jianKuan:Number,
    changXiuChang:Number,
    zuoWanWei:Number,
    youWanWei:Number,
    xiuFei:Number,
    xiaoTunWei:Number,
    qianShenChang:Number,
    qianXiongKuan:Number,
    houBeiKuan:Number,
    duanXiuChang:Number,
    duanXiuKou:Number,
    haoYiChiMa:String,
    keGongMianLiaoKuaiDiDanHao:String
}

const tiaoZhengChiCun = {
    shenGao:Number,
    tiZhong:Number,
    lingWei:Number,
    xiongWei:Number,
    yaoWei:Number,
    duWei:Number,
    diBian:Number,
    houYiChang:Number,
    jianKuan:Number,
    changXiuChang:Number,
    zuoWanWei:Number,
    youWanWei:Number,
    xiuFei:Number,
    xiaoTunWei:Number,
    qianShenChang:Number,
    qianXiongKuan:Number,
    houBeiKuan:Number,
    duanXiuChang:Number,
    duanXiuKou:Number,
    haoYiChiMa:String,
    keGongMianLiaoKuaiDiDanHao:String
}

const xuanXiang = {
    shenXing:String,
    houBeiKuanShi:String,
    changDuanXiu:String,
    lingXing:String,
    lingChaPian:String,
    xiuTou:String,
    menJin:String,
    kouDai:String,
    niuKou:String,
    zhuMai:String,
    mingXianKuan:String,
    ceFengGongYi:String,
    qianTiao:String,
    chenBu:String,
    ciXiuZiTi:String,
    ciXiuDaXiao:String,
    ciXiuWeiZhi:String,
    ciXiuNeiRong:String,
    ciXiuYanSe:String,
    xiMaiChengFen:String,
    baoZhuang:String,
    qiTa:String,
}
var schema = Schema({
    no: String,
    originOrderRef : {type : Schema.Types.ObjectId, ref : 'Order'},
    status : {type:Number, default : 0},
    date : Date,
    customerRef : {type : Schema.Types.ObjectId, ref : 'Customer'},
    brokerRef : {type : Schema.Types.ObjectId, ref : 'Broker'},
    agentRef : {type : Schema.Types.ObjectId, ref : 'Broker'},
    createrRef : {type : Schema.Types.ObjectId, ref : 'Staff'},
    approverRef : {type : Schema.Types.ObjectId, ref : 'Staff'},
    approveDate : Date,
    num : {type : Number, default : 1},
    amount : {type : Number, default : 0},
    item: String,
    isOnlinepay : {type:Boolean, default : false},
    comment: String,
    liangTi:{
    	date:Date,
    	address:{
    		province: String,
		    city: String,
            district: String,
		    detail: String,
		    contact: String,
		    mobile: String
    	},
    	sizeRef : {type : Schema.Types.ObjectId, ref : 'Size'},
    	jingChiCun:jingChiCun,
    	chengYiChiCun:chengYiChiCun,
    	tiaoZhengChiCun:tiaoZhengChiCun,
    	xuanXiang:xuanXiang,
    	beiZhu:String,
    	xiaBaiBeiZhu:String,
    	qiTaBeiZhu:String,
    },
    logisticsNo:String,
    logisticsCompany:String,
    logisticsRemark:String,
    logisticsDate:Date,
    luTaiMianLiaoRef : {type : Schema.Types.ObjectId, ref : 'Fabric'},
    keGongMianLiao : String,
    peiSeMianLiaoRef : {type : Schema.Types.ObjectId, ref : 'Fabric'},
    peiSeBuWei:String,
    paymentRefs:[{type : Schema.Types.ObjectId, ref : 'Payment'}],
    paymentDate:Date,
    transferResults:[{
        brokerRef : {type : Schema.Types.ObjectId, ref : 'Broker'},
        requestId:String,
        serialNumber:String,
        jointNumber:String,
        amount:Number
    }],
    transferFailure:String,
    receiveAddress:{
		province: String,
	    city: String,
	    detail: String,
	    contact: String,
	    mobile: String
	},
	isSent:{type:Number, default : 0},
    sentDate:Date,
    downloadCnt:{type:Number, default : 0},
    factoryNo:String,
	factoryRef : {type : Schema.Types.ObjectId, ref : 'Factory'},
}, {
    timestamps : true
});

schema.pre('save', function(next) {
    const log = require('../runtime/log');
    const Order = require('./Order');
    let originOrder = {}; 
    let doc = this;

    async.series([
        callback => {
            // doc.no
            doc._generateNo(Order, 'O', callback);
        },
        callback => {
            // doc.amount
            if(doc.luTaiMianLiaoRef){
                const Fabric = require('./Fabric');
                const Broker = require('./Broker');
                let price = 0;
                let priceLevel = 1;
                async.series([
                    callback =>{
                        if(doc.brokerRef){
                            Broker.findById(doc.brokerRef)
                            .exec((err,broker)=>{
                                if(broker.priceLevel === 0){
                                    priceLevel = 0
                                }
                                callback();
                            })
                        }else{
                            callback();
                        }
                        
                    },
                    callback =>{
                        if(doc.agentRef){
                            Broker.findById(doc.agentRef)
                            .exec((err,broker)=>{
                                if(broker.priceLevel === 0){
                                    priceLevel = 0
                                }
                                callback();
                            })
                        }else{
                            callback();
                        }
                        
                    },
                    callback =>{
                        Fabric.findById(doc.luTaiMianLiaoRef)
                        .exec((err,fabric)=>{
                            price = fabric.price;
                            //合伙人代理人存在，并且未加盟时
                            if((doc.brokerRef || doc.agentRef) && priceLevel === 1){
                                price = fabric.unjoinedPrice;
                            }
                            callback();
                        })
                    }
                ],(err,result)=>{
                    doc.amount = price * doc.num;
                    callback();
                })
            }else{
                callback();
            }
        },
        callback => {
            //支付状态更新
            if(!doc.isOnlinepay && doc.paymentRefs && doc.paymentRefs.length > 0 && doc.status < Order.PAID){
                const Payment = require('./Payment');
                let paymentAmount = 0;
                async.series(doc.paymentRefs.map(paymentRef=>{
                    return callback =>{
                        Payment.findById(paymentRef)
                        .exec((err,payment)=>{
                            if(payment.ehking && payment.ehking.tradeStatus === 'SUCCESS'){
                                paymentAmount += payment.ehking.amount;
                            }
                            if(payment.orderRef){
                                //支付信息对应订单ref已经绑定
                                callback();
                            }else{
                                //支付信息对应订单ref未绑定
                                payment.orderRef = doc.id;
                                payment.save(callback);
                            }
                        })
                    }
                }),(err,result)=>{
                    if(paymentAmount >= doc.amount){
                        doc.paymentDate = new Date();
                        doc.status = Order.PAID;
                    }
                    callback();
                })
            }else{
                callback();
            }
        },
        callback => {
            //分配状态更新
            if(doc.brokerRef && doc.status < Order.ASSIGNED){
                doc.status = Order.ASSIGNED;
            }
            //量体时间登陆
            if(doc.liangTi && !doc.liangTi.date && (doc.liangTi.sizeRef  || doc.liangTi.chengYiChiCun.shenGao)){
                doc.liangTi.date = moment();
            }        

            if(doc.liangTi && doc.liangTi.date && doc.status < Order.ASSIGNED){
                doc.status = Order.ASSIGNED;
            }    
            //物流状态更新
            if(doc.status === Order.SENT_FACTORY){
                if(!doc.sentDate){
                    doc.sentDate = new Date();
                }
                if(doc.logisticsRemark){
                    //输入物流信息后，状态变成配送中
                    doc.logisticsDate = new Date();
                    doc.status = Order.DISPATCHING;
                }
                if(doc.logisticsRemark && doc.logisticsRemark.indexOf('签收') >= 0){
                    //物流信息有【签收】时，状态变成已签收
                    doc.status = Order.SIGNED;
                }
            }
            if(doc.logisticsRemark && doc.status < Order.DISPATCHING){
                doc.logisticsDate = new Date();
                doc.status = Order.DISPATCHING;
            }
            //
            if(doc.status === Order.DISPATCHING && doc.logisticsRemark.indexOf('签收') >= 0){
                //物流信息有【签收】时，状态变成已签收
                doc.status = Order.SIGNED;
            }
            callback();
        }
    ], next)
});


schema.methods._generateNo = require('./methods/generateNo');
methods.trace(schema);

schema.methods._getStatus = () => {
    let doc = this;
    if(doc.status === doc.WAITING_ASSIGN){
        return '待分配';
    }else if(doc.status === doc.ASSIGNED){
        return '已分配';
    }else if(doc.status === doc.PAID){
        return '已量体支付';
    }else if(doc.status === doc.SENT_FACTORY){
        return '已发送至工厂';
    }else if(doc.status === doc.DISPATCHING){
        return '配送中';
    }else if(doc.status === doc.SIGNED){
        return '已签收';
    }else if(doc.status === doc.WAITING_REORDER_REVIEW){
        return '待审核重做';
    }else if(doc.status === doc.REORDERED){
        return '已重做';
    }else if(doc.status === doc.COMPLETE){
        return '已完成';
    }else{
        return '';
    }
}

schema.statics.WAITING_ASSIGN = 0; //待分配
schema.statics.ASSIGNED = 3; //已分配（待量体支付）
schema.statics.PAID = 6; //已量体支付（待发送至工厂）
schema.statics.SENT_FACTORY = 9; //已发送至工厂（待配送）
schema.statics.DISPATCHING = 12; //配送中
schema.statics.SIGNED = 15; //已签收
schema.statics.WAITING_REORDER_REVIEW = 18; //待审核重做
schema.statics.REORDERED = 21; //已重做（管理端审核成功）
schema.statics.COMPLETE = 24; //系统自动完成

module.exports = mongoose.model('Order', schema);
