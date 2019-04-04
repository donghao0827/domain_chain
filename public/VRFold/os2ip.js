const h2d = require('./h2d.js');
const BN = require('./BN');

const os2ip = function(x) {
    const strLen = x.length;
    const array = [];
    for (j = 0; j < strLen; j = j + 2){
        array.push(x.substr(j, 2));  
    }
    const len = array.length;
    let res = BN.zero;
    for (let i = 0; i < len; i++) {
        const coe = h2d.h2d(array[len - 1 - i]);
        const terms = BN.sqrt(256, i);
        const addNum = BN.mult(coe, terms);
        res = BN.add(res, addNum);
        console.log(i, ">>>>>>", len);
    }
    return res;
}

module.exports = os2ip;