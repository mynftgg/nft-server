var { getType } = require ("../utils/color");

async function colorTest(image) {
    var res = await getType(image);
    console.log(image, res);
}

colorTest('https://assets.solanavalley.com/70c21b3cf118ad91241c.png')
colorTest('https://www.arweave.net/KfMKho9KaQcidNK9lhetR31yTa4waqzZsFMjpeoP-fQ?ext=png')
colorTest('https://www.arweave.net/pLD4iEQcVF6coS5Zmv-Pnq2Q679gznxeErGpt76Y8ws')
colorTest('https://arweave.net/zn9E2LJ5mkEO5dSAUJSdc9Dd_RWh4tZ_MrC2BxsNhoM')


 