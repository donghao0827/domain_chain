// const {utils, ecvrf, sortition} = require('vrf.js');
// //const X = Buffer.from('test')

// const [publicKey, privateKey] = utils.generatePair();
// console.log(">>>>>>>", publicKey, ">>>>>>>", privateKey);


// const { ecvrf } = require('vrf.js')
// const Keys = require('./src/Key/Keys');
// const fs = require('fs');
// fs.writeFile('./src/Key/Key.json', JSON.stringify(Keys), { 'flag': 'w' }, (err) => {
//     if(err) {
//         throw err;
//     }
// });
// const Keys = require('./src/Key/Key.json');

// console.log("uijahdslhalsd", Keys);

const utils = require('./public/Utils');

console.log(utils.byte2Int([255,255,255,255,255,255,255,255]));
