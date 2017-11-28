var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = Schema({
    no: String,
    brokerRef: {type : Schema.Types.ObjectId, ref : 'Broker'},
    agentRef: {type : Schema.Types.ObjectId, ref : 'Broker'},
    createrRef: {type : Schema.Types.ObjectId, ref : 'Staff'},
    approverRef: {type : Schema.Types.ObjectId, ref : 'Staff'},
    approveDate : Date,
    status: {type:Number, default : 0},
    reason: String,
    confirmReason: String,
    responsibility: String,
    originOrderRef: {type : Schema.Types.ObjectId, ref : 'Order'},
    orderRef: {type : Schema.Types.ObjectId, ref : 'Order'}
}, {
    timestamps : true
});

schema.pre('save', function(next) {
    const Reorder = require('./Reorder');
    let doc = this;
    doc._generateNo(Reorder, 'R', next);
});

schema.methods._generateNo = require('./methods/generateNo');

module.exports = mongoose.model('Reorder', schema);
