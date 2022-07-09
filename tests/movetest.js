const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const borsh = require('borsh');
const utils = require('../utils.js');
const request = require('request');
var express = require("express");
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
var EloRating = require('elo-rating');
var {deltaE, rgb2lab, getType} = require ("../utils/color");
var {convertArrayToObject} = require ("../utils/helper");
var moves = require('../schemas/types/moves.json')

var path = require('path');

const type = "fire"



// Shuffle moves
// const shuffled = relevantMoves.sort(() => 0.5 - Math.random());
// let selectedMoves = shuffled.slice(0, 4);
// var transformedMoves = convertArrayToObject(selectedMoves, 'name');

const relevantMoves = moves.filter(move => move.type == type ||  move.type == "normal");
const otherMoves = moves.filter(move => move.type != type );
const shuffled = relevantMoves.sort(() => 0.5 - Math.random());
let selectedMoves = shuffled.slice(0, 3);
var transformedMoves = convertArrayToObject(selectedMoves, 'name');
const randomMove = Math.floor(Math.random() * otherMoves.length-1) + 1;
selectedMoves.push(otherMoves[randomMove]);
console.log(transformedMoves);

