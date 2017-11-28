var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = Schema({
	requestId:String, //requestId
	ehking:{
		amount:Number,
		checkAccountNumber:String, //对账码
		paymentMode:String,
		requestId:String,
		status:String,
		tradeStatus:String,
		createDateTime:Date,
		completeDateTime:Date,
		jointNumber:String,
	},
	onlinepay:{
        orderAmount:Number,
        notifyUrl:String,
        callbackUrl:String,
        clientIp:String,
        paymentModeCode:String,
        hiddenPD:String,
        scanCode:String,
        status:String,
        resRaw: Object
	},
	brokerRef:{type : Schema.Types.ObjectId, ref : 'Broker'},
    orderRef: {type : Schema.Types.ObjectId, ref : 'Order'},
    raw: Object,
    remark: String
}, {
    timestamps : true
});

schema.statics.EHKING = 0; //合伙人代理人

module.exports = mongoose.model('Payment', schema);
