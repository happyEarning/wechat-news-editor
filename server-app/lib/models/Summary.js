var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = Schema({
    item: String,
    num: Number,
    factoryRef:{type : Schema.Types.ObjectId, ref : 'Factory'},
    orderRefs:[{type : Schema.Types.ObjectId, ref : 'Order'}],
    createrRef : {type : Schema.Types.ObjectId, ref : 'Staff'},
    remark: String
}, {
    timestamps : true
});

module.exports = mongoose.model('Summary', schema);
