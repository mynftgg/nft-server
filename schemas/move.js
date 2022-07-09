var mongoose = require('mongoose');
var {typesEnum} = require("./types/types.js");
var Schema = mongoose.Schema;

var moveSchema = new Schema({
    "name": String,
    "power": Number,
    "type": {type: String,
        enum: typesEnum
    }
});

var moveModel = mongoose.model('move', moveSchema );

module.exports = {moveModel: moveModel,  moveSchema: moveSchema }