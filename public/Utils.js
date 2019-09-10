const SHA256 = require("crypto-js/sha256");
const { MerkleTree } = require('merkletreejs');

var Utils = function() {};
Utils.prototype = {
    calculateHash: function(str) {
        return SHA256(str).toString();
    },
    serialize: function(obj) {
        let str = "";
        for (let index in obj) {
            if(typeof(obj[index]) === "object") str = str + JSON.stringify(obj[index]);
            str = str + obj[index];
        }
        return str;
    },
    calculateMerkleRoot(transactions){
        const leaves = transactions.map(x =>this.calculateHash(x));
        const tree = new MerkleTree(leaves, SHA256);
        return tree;
    },
    byte2Int(bytes) {
        const len = bytes.length;
        const bytesRev = bytes.reverse();
        let count = 0;
        for(let i = 0; i < len; i++) {
            count = count + bytes[i];
        }
        return count;
    }
} 

module.exports = new Utils();
