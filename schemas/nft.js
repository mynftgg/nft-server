var mongoose = require('mongoose');
var { moveModel, moveSchema } = require('./move');
var Schema = mongoose.Schema;
var {typesEnum} = require("./types/types.js");

var nftSchema = new Schema({
    _id: String,
    "name": String,
    "symbol": String,
    "description": String,
    "seller_fee_basis_points": Number,
    "image": String,
    "originalImage": String,
    "external_url": String,
    "attributes": [Object],
    "nft_collection": [Object],
    "properties": [Object],
    "level": Number,
    "moves": [moveSchema],
    "hp": Number,
    "attack": Number,
    "defense": Number,
    "type": [String],
    "stats": Object,    
    // "type": {type: String,
    //     enum: typesEnum
    // },
    "exp": Number,
    "expForNextlevel": Number,
    "attacks": Object,
});

var nftModel = mongoose.model('nft', nftSchema );

module.exports = {nftModel: nftModel,  nftSchema: nftSchema }