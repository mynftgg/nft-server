const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const fs = require("fs")

const QN_URL = "https://rough-small-cloud.solana-mainnet.quiknode.pro/aaaa86b6af03e2c9cb0d2fd339206fb590eb7b65/"

const hashlist = JSON.parse(fs.readFileSync("hashlist.json"))
const trainersById = {}

for (let nft of hashlist) {
    trainersById[nft.id] = nft
}

const connection = new solanaWeb3.Connection(
    QN_URL,
    "confirmed",
)

async function getOwnedTrainers(walletAddress) {
    const publicKey = new solanaWeb3.PublicKey(walletAddress)

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: splToken.TOKEN_PROGRAM_ID
    })

    const trainers = []

    for (let tokenAccount of tokenAccounts.value) {
        const mintAddress = tokenAccount.account.data.parsed.info.mint

        if (mintAddress in trainersById) {
            trainers.push(trainersById[mintAddress])
        }
    }

    return trainers
}

module.exports = { getOwnedTrainers, trainersById }
