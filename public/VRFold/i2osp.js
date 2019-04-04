const d2h = require('./h2d.js');
const a2d = require('./h2d.js');
const BN = require('./BN');
const BigNumber = require('big-number');

const i2osp = function(x, xLen) {
    const X =  BigNumber(x);
    if(X.gte(BN.sqrt(256, xLen))) {
        console.log("integer too large");
        return false;
    }
    const array = [];
    for(i = 0; i < xLen; i++) {
        array[i] = BN.zero; 
    }
    let j = 0;
    let y = X;
    while(!BN.div(y, 256).equals(0))
    {
        array[xLen - 1 - j] = BN.mod(y, 256);
        y = BN.div(y, 256);
        j++;
        console.log(j, ">>>>", xLen);
    }
    array[xLen - 1 - j] = BN.mod(y, 256);
    return array.map((a) => {
        const d = a2d.a2d(a);
        return d2h.d2h(d);
    }).join('');
}

module.exports = i2osp;