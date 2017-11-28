var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = Schema({
    title: String,
    aboutUs: {type:Boolean,default : false},
    wiki: {type:Boolean,default : false},
    order: {type:Boolean,default : false},
    reorder: {type:Boolean,default : false},
    pics2d:[[String]]
}, {
    timestamps : true
});

module.exports = mongoose.model('Information', schema);
