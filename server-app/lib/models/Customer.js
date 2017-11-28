var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var schema = Schema({
    name: String,
    mobile : String,
    tags:[String]
}, {
    timestamps : true
});

module.exports = mongoose.model('Customer', schema);
