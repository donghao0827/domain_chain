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
     }
} 

module.exports = new Utils();
