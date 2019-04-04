const SHA256 = require("crypto-js/sha256");

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
    }
} 

module.exports = new Utils();
