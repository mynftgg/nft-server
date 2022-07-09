var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
  _id: String, // address
  address: String,
  username: String,
  nftIds: [String],
  friends: [],
  referrals: Number,
  imagesDownloaded: Boolean,
  rating: Number
});

var accountModel = mongoose.model('account', accountSchema );

module.exports = {accountSchema, accountModel }