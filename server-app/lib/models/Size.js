var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = Schema({
    gender:Number,
    description:String,
	lingWei:Number,
	xiongWei:Number,
	yaoWei:Number,
	diBian:Number,
	houYiChang:Number,
	jianKuan:Number,
	xiuChang:Number,
	xiuTouChang:Number,
	xiuFei:Number,
	xiuZhouFei:Number,
	qianShenChang:Number,
	qianXiongKuan:Number,
	houBeiKuan:Number,
	duanXiuChang:Number,
	duanXiuKou:Number
}, {
    timestamps : true
});

module.exports = mongoose.model('Size', schema);
