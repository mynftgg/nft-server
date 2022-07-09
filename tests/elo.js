var EloRating = require('elo-rating');
 
var playerWin = false;
var result = EloRating.calculate(1750, 1535, playerWin);
 
console.log(result.playerRating) // Output: 1735
console.log(result.opponentRating) // Output: 1550
 
result = EloRating.calculate(1750, 1535);
 
console.log(result.playerRating) // Output: 1754
console.log(result.opponentRating) // Output: 1531