var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var schema = Schema({
  articles: Array,
  mediaId:String
}, {
    timestamps: true
  });

module.exports = mongoose.model('News', schema);
