var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = Schema({
    mobile: String,
    password:String,
    name: String,
    brokerRef : {type : Schema.Types.ObjectId, ref : 'Broker'}
    
}, {
    timestamps : true
});

module.exports = mongoose.model('Staff', schema);
