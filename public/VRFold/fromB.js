const BN = require('big-number');
const BNum = require('./BN');

const fromB = function(buffer) {
    const reverseBuffer = buffer.reverse();
    const len = buffer.length;
    const newBuffer = [];
    for(let i = 0; i < len; i = i + 16) {
        const N = (buffer[i] ? buffer[i] : 0) + 
        (buffer[i + 1] ? buffer[i + 1] : 0) * 256 + 
        (buffer[i + 2] ? buffer[i + 2] : 0) * 256 * 256 + 
        (buffer[i + 3] ? buffer[i + 3] : 0) * 256 * 256 * 256;
        (buffer[i + 4] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256;
        (buffer[i + 5] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 6] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 7] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 8] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 9] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 10] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 11] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 12] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 13] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 14] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 15] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256;
        (buffer[i + 16] ? buffer[i + 3] : 0) * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256 * 256;
        newBuffer.push(BN(N));
    }
    const len2 = newBuffer.length;
    let res = BN(0);
    for(let i = 0; i < len2; i++) {
        const radix = BN(256).mult(256).mult(256).mult(256).mult(256).mult(256).mult(256).mult(256).mult(256).mult(256).mult(256).mult(256).mult(256).mult(256).mult(256).mult(256);
        const coe = newBuffer[i];
        const term = BNum.sqrt(radix, i);
        res = BNum.add(BNum.mult(coe, term), res);
        console.log(i, ">>>>>>", len2)
    }
    return res;
} 

module.exports = fromB;