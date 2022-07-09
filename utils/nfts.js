const solanaWeb3 = require("@solana/web3.js")
const splToken = require("@solana/spl-token")
const axios = require("axios")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const sharp = require('sharp')

const moves = require('../schemas/types/moves.json')
const utils = require("../utils.js")
const { getType } = require("./color");
const { convertArrayToObject } = require("./helper");
const { trainersById } = require("./hashlist")

const QN_URL = "https://rough-small-cloud.solana-mainnet.quiknode.pro/aaaa86b6af03e2c9cb0d2fd339206fb590eb7b65/"
const METADATA_PUBKEY = new solanaWeb3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")

const MAX_NFTS = 20
const MAX_PROMISES = 25

const s3 = new S3Client({ region: "us-east-1" })
const S3_BUCKET = "mynftgg"
const S3_URL_PREFIX = `https://${S3_BUCKET}.s3.amazonaws.com`

async function fetchNfts(walletAddress, downloadImages) {
    let nfts
    let failures

    try {
        [nfts, failures] = await fetchNfts_manual(walletAddress)
    } catch (err) {
        console.warn("Error while calling fetchNfts_manual", err)
    }

    if (!nfts) {
        return []
    }

    const promises = []

    if (downloadImages) {
        for (let nft of nfts) {
            promises.push(getNftImage(nft))
        }
    }

    await Promise.all(promises)
    
    return nfts
}

async function fetchNfts_manual(walletAddress) {
    var publicKey = new solanaWeb3.PublicKey(walletAddress)

    var connection = new solanaWeb3.Connection(
        QN_URL,
        "confirmed",
    )

    // Get token accounts from wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: splToken.TOKEN_PROGRAM_ID
    })

    const promises = []

    for (let tAccount of tokenAccounts.value) {
        const mintAddress = tAccount.account.data.parsed.info.mint

        if (mintAddress in trainersById) {
            continue
        }

        const tokenAmount = tAccount.account.data.parsed.info.tokenAmount

        // Check that it's an NFT
        if (tokenAmount.amount == "1" && tokenAmount.decimals == "0") {
            promises.push(getNftFromTokenAccount(tAccount, connection))
        }

        if (promises.length == MAX_PROMISES) {
            break
        }
    }

    const results = await Promise.allSettled(promises)

    const nfts = []
    let failures = false

    for (let result of results) {
        if (result.status == "fulfilled") {
            nfts.push(result.value)
        } else {
            failures = true
            console.warn("Failed to fetch NFT", result.reason)
        }

        if (nfts.length == MAX_NFTS) {
            break
        }
    }

    return [nfts, failures]
}

async function getNftFromTokenAccount(tAccount, connection) {
    // Parse PDA to get NFT metadata
    const [pda, _] = await solanaWeb3.PublicKey.findProgramAddress([
        "metadata",
        METADATA_PUBKEY.toBuffer(),
        (new solanaWeb3.PublicKey(tAccount.account.data.parsed.info.mint)).toBuffer(),
    ], METADATA_PUBKEY)

    const accountInfo = await connection.getParsedAccountInfo(pda)
    const decoded = utils.decodeMetadata(accountInfo.value.data)
    const res = await axios.get(decoded.data.uri)

    return {
        _id: decoded.mint,
        name: res.data.name,
        originalImage: res.data.image,
        attributes: res.data.attributes,
        description: res.data.description
    }
}

async function setNftAttributes(nft) {
    nft.stats = {
        level: 1,
        hp: 25,
        attack: 10,
        defense: 5,
        exp: 0
    }

    nft.hp = 25;
    nft.expForNextlevel = 50;

    // Type & move assignment
    const type = await getType(nft.originalImage)
    nft.type = [type.name]

    const relevantMoves = moves.filter(move => move.type == type.name && move.power != null)

    // Pick 1 random normal move
    const normalMoves = moves.filter(move => move.type == "normal" && move.power != null)
    const randomNormalMove = normalMoves.sort(() => 0.5 - Math.random())[0]

    // Pick 3 random moves that match their type
    const shuffled = relevantMoves.sort(() => 0.5 - Math.random())
    const selectedMoves = shuffled.slice(0, 3)
    selectedMoves.push(randomNormalMove)

    var transformedMoves = convertArrayToObject(selectedMoves, "name")
    nft.attacks = transformedMoves

    return nft
}

async function getNftImage(nft) {
    const res = await axios.get(nft.originalImage, { responseType: "arraybuffer" })

    const resizedImage = await sharp(res.data)
        .resize({
            height: 36,
            width: 36,
            fit: sharp.fit.inside,
            position: sharp.strategy.entropy
        })
        .toBuffer()
    
    const buffer = await sharp("./images/frame.png")
        .composite([{ input: resizedImage }])
        .toBuffer()

    // URI encode to deal with special chars
    const key = `frames_36x36/${encodeURIComponent(nft.originalImage)}`

    const command = new PutObjectCommand({
        "Bucket": S3_BUCKET,
        "Key": key,
        "Body": buffer,
        "ContentType": "image/png"
    })

    try {
        await s3.send(command)
    } catch (err) {
        console.warn("Error uploading image to S3", err)
        return null
    }

    // S3 encodes the key again
    nft.image = `${S3_URL_PREFIX}/${encodeURIComponent(key)}`
}

module.exports = { fetchNfts, setNftAttributes }
