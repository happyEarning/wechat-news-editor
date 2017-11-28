var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = Schema({
    name: String
}, {
    timestamps : true
});

module.exports = mongoose.model('Tag', schema);
