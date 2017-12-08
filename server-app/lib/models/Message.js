var mongoose = require('mongoose'),
Schema = mongoose.Schema;

// type: image media
var schema = Schema({
key:String,
value: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', schema);
