const BigNumber = require('big-number');

function BN(num) {
    this.zero = BigNumber(0);
}

BN.prototype = {
    sqrt: function(num, exp) {
        let res = BigNumber(1);
        for (let i = 1; i <= exp; i++) {
            res = res.mult(num);
        }
        return res;
    },
    add: function(add1, add2) {
        return BigNumber(add1).plus(add2)
    },
    sub: function(sub1, sub2) {
        return BigNumber(sub1).minus(sub2);
    },
    mult: function(mult1, mult2) {
        return BigNumber(mult1).mult(mult2);
    },
    div: function(div1, div2) {
        return BigNumber(div1).div(div2);
    },
    mod: function(div1, div2) {
        return BigNumber(div1).mod(div2);
    }
}

module.exports = new BN();

