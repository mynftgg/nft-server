const solanaWeb3 = require("@solana/web3.js")
const fs = require("fs")
const axios = require("axios")
const utils = require("../utils.js")

const QN_URL = "https://rough-small-cloud.solana-mainnet.quiknode.pro/aaaa86b6af03e2c9cb0d2fd339206fb590eb7b65/"
const METADATA_PUBKEY = new solanaWeb3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")

var connection = new solanaWeb3.Connection(
    QN_URL,
    "confirmed",
)

async function getNftFromAddress(address) {
    // Parse PDA to get NFT metadata
    const [pda, _] = await solanaWeb3.PublicKey.findProgramAddress([
        "metadata",
        METADATA_PUBKEY.toBuffer(),
        (new solanaWeb3.PublicKey(address)).toBuffer(),
    ], METADATA_PUBKEY)

    const accountInfo = await connection.getParsedAccountInfo(pda)
    const decoded = utils.decodeMetadata(accountInfo.value.data)
    const res = await axios.get(decoded.data.uri)

    if (decoded.mint != address) {
        console.error("Weird")
    }

    return {id: decoded.mint, ...res.data}
}

async function main() {
    const hashlist = JSON.parse(fs.readFileSync("../hashlist.json"))
    const hashlistWithDetails = []
    const failures = []
    let count = 0

    for (let address of hashlist) { 
        let success = false

        for (let i = 0; i < 3; ++i) {
            try {
                nft = await getNftFromAddress(address)
                hashlistWithDetails.push(nft)
                success = true
                break
            } catch {
                console.log(`Retrying ${address} ...`)
            }
        }

        if (!success) {
            console.log(`Failed {address}`)
            failures.push(address)
        }

        count += 1

        if (count % 50 == 0) {
            console.log("Finished", count)
        }
    }

    console.log("Finished", count)

    fs.writeFileSync(
        "../hashlist-with-details.json",
        JSON.stringify(hashlistWithDetails)
    )

    fs.writeFileSync(
        "../failures.json",
        JSON.stringify(failures)
    )
}

async function getFailures() {
    const hashlistWithDetails = JSON.parse(fs.readFileSync("../hashlist-with-details.json"))
    const failures = JSON.parse(fs.readFileSync("../failures.json"))
    let count = 0

    for (let address of failures) { 
        let success = false

        for (let i = 0; i < 3; ++i) {
            try {
                nft = await getNftFromAddress(address)
                hashlistWithDetails.push(nft)
                success = true
                break
            } catch {
                console.log(`Retrying ${address} ...`)
            }
        }

        if (!success) {
            console.log(`Failed {address}`)
        }

        count += 1

        if (count % 50 == 0) {
            console.log("Finished", count)
        }
    }

    console.log("Finished", count)

    fs.writeFileSync(
        "../hashlist-with-details.json",
        JSON.stringify(hashlistWithDetails)
    )
}

// main()
getFailures()
