
const axios = require('axios');


const fs = require('fs');
// const http = require('https'); // or 'https' for https:// URLs
var http = require('follow-redirects').https;
// const json = require('json');


// function makeGetRequest(path) {
//     return new Promise(function (resolve, reject) {
//         axios.get(path).then(
//             (response) => {
//                 var result = response.data;
//                 console.log('Processing Request');
//                 resolve(result);
//             },
//                 (error) => {
//                 reject(error);
//             }
//         );
//     });
// }
  
// async function main() {
//     var result = await makeGetRequest('http://127.0.0.1:4000/getNFTs/EUMxCpJ6mvmCU9bNn26TaKPCVzrk5Ccj2NV2VpVXGVyk');
//     console.log(result.result);
//     console.log('Statement 2');
// }
// main();

axios.get("http://127.0.0.1:4000/getNFTs/EUMxCpJ6mvmCU9bNn26TaKPCVzrk5Ccj2NV2VpVXGVyk").then(response =>
{
    // console.log(response.data)
    response.data.nftList.forEach((nft, idx) => {
        const file = fs.createWriteStream( "nft_" + idx + ".png");
        console.log(nft.image);
        // download all the nft images
        
        const request = http.get(nft.image, function(response) {
            console.log(response);
            response.pipe(file);


            // can we edit SampleMap directly from here? 
        
        });
        
    })

    
});