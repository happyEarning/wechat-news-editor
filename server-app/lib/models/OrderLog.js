var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = Schema({
    orderNo: String,
    originOrder:String,
    order:String,
}, {
    timestamps : true
});

module.exports = mongoose.model('OrderLog', schema);
