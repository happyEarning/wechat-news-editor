var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var schema = Schema({
  title: String,
  thumb: String,
  content: String,
  des: String,
  author: String,
  originLink: String,
}, {
    timestamps: true
  });

module.exports = mongoose.model('Article', schema);
