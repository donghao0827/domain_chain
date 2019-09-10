const i2osp = require('./i2osp.js');
const SHA256 = require("crypto-js/sha256");

const mgf1 =  function(mgfSeed, maskLen) {
    if (maskLen > 2 ** 32) {
        console.log("mask too long!");
        return false;
    } 
    let T = "";
    hLen = 8; //采用sha256哈希算法
    for(let i = 0; i <= (maskLen/hLen)-1; i++) {
        let C = i2osp(i, 4);
        T = SHA256(mgfSeed + C) + T;
    }
    return T.substr(0, maskLen * 2);
}

module.exports = mgf1;