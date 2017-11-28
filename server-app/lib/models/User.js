var mongoose = require('mongoose'),
    async = require('async'),
    Schema = mongoose.Schema;


var schema = Schema({
    openid: String,
    brokerRef : {type : Schema.Types.ObjectId, ref : 'Broker'},
    customerRef : {type : Schema.Types.ObjectId, ref : 'Customer'}
}, {
    timestamps : true
});


schema.post('save', function(doc,next) {

    const Broker = require('./Broker');
    const WechatDecorator = require('../decorators/WechatDecorator');
    let tag;

    async.series([
        callback => {
        	if(doc.brokerRef){
        		Broker.findById(doc.brokerRef)
        		.exec((err,broker)=>{
        			if(broker.isBroker){
        				//合伙人
        				tag = 102;
        			}else{
        				//代理人
        				tag = 103;
        			}
        			callback();
        		})
        	}else if(doc.customerRef){
        		//客户
        		tag = 101;
        		callback();
        	}else{
                callback();
            }
        }
    ], (err,result)=>{
        WechatDecorator.userTagging(doc.openid,tag,next);
    })
});
module.exports = mongoose.model('User', schema);
