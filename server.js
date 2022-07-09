var express = require("express");
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const EloRating = require('elo-rating');

const { getOwnedTrainers } = require("./utils/hashlist");
const { fetchNfts, setNftAttributes } = require("./utils/nfts");

var path = require('path');

var port = process.env.PORT || 4000

var http = require('follow-redirects').https; // or 'https' for https:// URLs
const sharp = require('sharp');
sharp.cache(false);

var { accountModel } = require('./schemas/account');
var { battleModel } = require('./schemas/battle');
var { gameScoreModel } = require('./schemas/game-score');
var { nftModel } = require('./schemas/nft');

require("dotenv").config({ path: "./.env" });

var serverURL = "https://my-nft-server.herokuapp.com";

if (process.env.NODE_ENV == "DEV") {
    serverURL = "http://localhost:4000";
}

console.log("SERVERURL", serverURL)

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

console.log(process.env.DB_USER);
const mongodbURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(path.join(__dirname, '/public')));

console.log('Solana Server Running')
console.log(path.join(__dirname, '/public'))

function saveModel(model, modelName){
    model.save(function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log(modelName + " Saved");
            console.log(model);
        }
    });
}

function isAuthed(req) {
    return req.headers.authorization == `Basic ${process.env.AUTH_TOKEN}`
}

app.get("/:publicKey/trainers", async (req, res, next) => {
    const publicKey = req.params.publicKey
    const trainers = await getOwnedTrainers(publicKey)
    res.json({ trainers })
})

app.get("/:publicKey/nfts", async (req, res, next) => {
    if (!isAuthed(req)) {
        res.sendStatus(401)
        return
    }

    const publicKey = req.params.publicKey
    let account = await accountModel.findOne({ _id: publicKey }).exec()
    let nftModels

    if (req.query.refresh
        || account == null
        || account.nftIds == null
        || account.nftIds.length == 0
    ) {
        const nfts = await fetchNfts(publicKey, req.query.downloadImages)
        const nftIds = nfts.map(x => x._id)

        const existingNfts = await nftModel.find({ _id: { "$in": nftIds }}).exec()
        const existingNftsById = {}

        for (let nft of existingNfts) {
            existingNftsById[nft._id] = nft
        }

        nftModels = []

        for (let nft of nfts) {
            const existingNft = existingNftsById[nft._id]
            let nftToSave

            if (existingNft) {
                // Update existing NFT in case of on-chain data changes
                existingNft.name = nft.name
                existingNft.description = nft.description
                existingNft.image = nft.image || existingNft.image
                existingNft.originalImage = nft.originalImage
                existingNft.attributes = nft.attributes
                nftToSave = existingNft
            } else {
                await setNftAttributes(nft)
                nftToSave = new nftModel(nft)
            }

            saveModel(nftToSave, "NFT")
            nftModels.push(nftToSave)
        }

        if (!account) {
            account = new accountModel({
                _id: publicKey,
                address: publicKey,
                nftIds: nftIds,
                rating: 0
            });
        }

        account.nftIds = nftIds
        saveModel(account, "Account")
    } else {
        nftModels = await nftModel.find({ _id: { "$in": account.nftIds }}).exec()
    }

    nftModels.sort(function (a, b) {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    })

    res.json({ nfts: nftModels });
});

app.post("/:publicKey/username", async (req, res, next) => {
    const publicKey = req.params.publicKey;
    let account = await accountModel.findOne({ _id: publicKey }).exec();

    if (!account) {
        let accountNFTs = await getNFTs(publicKey, null)
        account = new accountModel({ _id: publicKey, rating: 0, nfts: accountNFTs });
    }

    account.username = req.body.username;
    saveModel(account, "Account");
    res.send({ "username": account.username });
});

app.get("/:publicKey/username", async (req, res, next) => {
    const publicKey = req.params.publicKey;
    const account = await accountModel.findOne({ _id: publicKey }).exec();

    if (!account) {
        res.send({ "username": null });
    } else {
        res.send({ "username": account.username });
    }
});

app.post("/nft/exp", async (req, res, next) => {
    if (!isAuthed(req)) {
        res.sendStatus(401)
        return
    }

    const nfts = []

    for (let expAmount of req.body.nfts) {
        const nft = await nftModel.findOne({ _id: expAmount.id }).exec()

        nft.stats.exp = nft.stats.exp + expAmount.amount

        while (nft.stats.exp > 100) {
            nft.stats.level = nft.stats.level + 1
            nft.stats.exp = nft.stats.exp - 100
        }

        nft.markModified("stats")
        saveModel(nft, "NFT")
        nfts.push(nft)
    }

    res.json({ nfts: nfts })
});

app.post("/recordWinner", async (req, res, next) => {
    if (!isAuthed(req)) {
        res.sendStatus(401)
        return
    }

    console.log(req.body.winner_address)
    console.log(req.body.loser_address)

    // record the battle
    var latestBattle = new battleModel({winner_address: req.body.winner_address, loser_address: req.body.loser_address, winner_username:req.body.winner_username, loser_username:req.body.loser_username  });
    latestBattle.save(function (err) {
        if (err){
            console.log(err)
        } else {
            console.log("New Battle Recorded: " + latestBattle);
        }
    });

    // update ranking of players
     const winnerAccount = await accountModel.findOne({ _id: req.body.winner_address }).exec();
     const loserAccount = await accountModel.findOne({ _id: req.body.loser_address }).exec();

     var result = EloRating.calculate(winnerAccount.rating, loserAccount.rating, true);
     winnerAccount.rating = result.playerRating;
     loserAccount.rating = result.opponentRating;

     saveModel(winnerAccount, "Account");
     saveModel(loserAccount, "Account");

    res.send({winnerRank: winnerAccount.rating, loserRank: loserAccount.rating});
});

app.post("/recordGameScore", async (req, res, next) => {
    if (!isAuthed(req)) {
        res.sendStatus(401)
        return
    }

    const score = new gameScoreModel({
        username: req.body.username,
        address: req.body.address,
        game: req.body.game,
        score: req.body.score
    })

    saveModel(score, "GameScore")
    res.send({ success: true })
})

app.get("/leaderboard", async (req, res, next) => {
    const accounts = await accountModel.find({}).sort({rating: -1}).exec();
    var collections = [
        {name: "Thugbirdz",
        battlesWon: 65,
        numberOfPlayers: 22,
        averageLevel: 5,
        rank: 1,
        boost: "+20 HP"
        },
        {name: "SMB Monkee",
        battlesWon: 45,
        numberOfPlayers: 15,
        averageLevel: 4,
        rank: 2,
        boost: "+10 HP"
        },
        {name: "Degen Aples",
        battlesWon: 22,
        numberOfPlayers: 13,
        averageLevel: 4,
        rank: 3,
        boost: "+5 HP"
        },
    ];

    // accounts.forEach(account => {
    //     account.forEach(nft => {
    //         // collections.push(nft.name);
    //     })
    // })
    res.send({accounts: accounts, collections: collections});
});

app.listen(port, () => {
    console.log("Server running on port 4000");
});