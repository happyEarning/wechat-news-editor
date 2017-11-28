var mongoose = require('mongoose'),
    GenericStatus = require('./enum/GenericStatus');
    Schema = mongoose.Schema;

var schema = Schema({
    mobile: String,
    name: String,
    belongToRef:{type : Schema.Types.ObjectId, ref : 'Broker'},
    identity: String,
    province: String,
    city: String,
    districts: [String],
    detail: String,
    status: {type:Number,default : GenericStatus.WAITING_REVIEW},
    isBroker: {type:Boolean,default : false},
    isDeleted: {type:Boolean,default : false},
    priceLevel: {type:Number,default : 0},
    approverRef : {type : Schema.Types.ObjectId, ref : 'Staff'},
    approveDate : Date,
    assignedDate: Date,
    failureReason : String,
    ehking:{
        email:String,
        jointNumber:String,
        qrcodeUrl:String,
        bankAccountNo:String,
        bankName:String,
        name:String, //注册名称
        bankAccountName:String //银行账号人名
    }
}, {
    timestamps : true
});


schema.post('save', function(doc,next) {
    const Staff = require('./Staff');
    if(doc.status == GenericStatus.NORMAL){
        Staff.count({
            mobile:doc.mobile
        },function(err,count){
            if(count <= 0){
                let staff = new Staff({
                    mobile:doc.mobile,
                    password:doc.mobile,
                    name:doc.mobile,
                    brokerRef:doc.id
                });
                staff.save(next);
            }else{
                next();
            }
        })
    }else{
        next();
    }
});
module.exports = mongoose.model('Broker', schema);
