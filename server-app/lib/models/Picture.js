var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

  // type: image media
var schema = Schema({
  mediaId:String,
  url: String,
  wxUrl: String,
  type:String
}, {
    timestamps: true
  });

module.exports = mongoose.model('Picture', schema);
