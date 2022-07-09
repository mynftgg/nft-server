var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameScoreSchema = new Schema({
  game: String,
  address: String,
  username: String,
  score: Number
}, { timestamps: true });

var gameScoreModel = mongoose.model('gameScore', gameScoreSchema );

module.exports = { gameScoreSchema, gameScoreModel }