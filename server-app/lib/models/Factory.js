var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = Schema({
    name: String,
    mail: String
}, {
    timestamps : true
});

module.exports = mongoose.model('Factory', schema);
