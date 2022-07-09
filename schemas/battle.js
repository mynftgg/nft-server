var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var battleSchema = new Schema({
    "winner_address": String,
    "loser_address": String,
    "winner_username": String,
    "loser_username": String,
}, { timestamps: true });

var battleModel = mongoose.model('battle', battleSchema );

module.exports = {battleModel: battleModel,  battleSchema: battleSchema }