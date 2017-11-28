var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var schema = Schema({
  url: String,
  wxUrl: String
}, {
    timestamps: true
  });

module.exports = mongoose.model('Picture', schema);
