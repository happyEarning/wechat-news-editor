var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = Schema({
    no: String,
    name: String,
    category: String,
    isListing:Boolean,
    price:{type : Number, default : 0},
    unjoinedPrice:{type : Number, default : 0},
    userPrice:{type : Number, default : 0},
    zhiShu:String,
    miDu:String,
    chenFen:String,
    pics:[String]
}, {
    timestamps : true
});

module.exports = mongoose.model('Fabric', schema);
