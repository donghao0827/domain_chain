// const vrf = require('vrf.js');
// const seed = Buffer.from('sortition');
// const role = Buffer.from('test')
// // const w = vrf.utils.N(100)
// // const W = vrf.utils.N(1000)
// // const tau = vrf.utils.N(10)


// const [publicKey, privateKey] = vrf.utils.generatePair();
// // const [value, proof, j] = vrf.sortition.sortition(
// //     privateKey, publicKey,
// //     seed, tau, role, w, W
// //   )
// // if (+j > 0) {
// //     console.log(j.toString());
// // }
// //console.log(+j);

// const {value, proof} = vrf.ecvrf.vrf(publicKey, privateKey, seed);
// const res = vrf.ecvrf.verify(publicKey, seed, proof, value);
// console.log(value);


// const BigNumber = require('big-number');
// // //const BN = new BigNumber();
// // const os2ip = require('./os2ip');
// const i2osp = require('./i2osp');

// console.log(i2osp(BigNumber(1212), 16));

//const BN = require('./BN');

/*
const i2osp = require('./i2osp');
const os2ip = require('./os2ip');
const mgf1 = require('./mgf1');
const RSA = require('node-rsa');
const fromB = require('./fromB');

const key = new RSA({b: 512});

const alpha = "sortition";
const EM = mgf1(alpha, 1023);
const m = os2ip(EM);
const s = key.encrypt(m.number, 'buffer');  // 加密后数据
const pi = i2osp(fromB(s), 1024)
console.log('proof: ', pi);
*/

// const fromB = require('./fromBuffer');
// console.log(fromB([1,2,34,4,5,6,77,8,9,20], 256, true));

// const fromB = require('./fromB');
// const buf = [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,];
// console.log(">>>>>", fromB(buf));


// const encrypted = key.encrypt(m, 'base64');  // 加密后数据
// // const decrypted = key.decrypt(encrypted, 'utf8'); // 解密后数据
// console.log('encrypted: ', decrypted);

const sha = require("crypto-js/sha256");
console.log(sha(1212));