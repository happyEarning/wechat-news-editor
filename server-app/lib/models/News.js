var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var schema = Schema({
  articles: [{ type: Schema.Types.ObjectId, ref: 'News' }],
}, {
    timestamps: true
  });

module.exports = mongoose.model('News', schema);
