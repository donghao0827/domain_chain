var utils = require("../../public/Utils");
const { PK, SK } = require('../Key/Key');
<<<<<<< HEAD
const { encrypt, decrypt } = require('../../public/rsa/RSA');
=======
const { encrypt, decrypt } = require('../../public/RSA/RSA');
>>>>>>> 8d017b1d05739d3fa5f9d2047c0da7a3b5a483cb
// const cipher = encrypt(SK, Buffer.from('11'));
// console.log(decrypt(PK, cipher));

class Transaction {
    constructor(
            version, 
            uuid, 
            business, 
            type, sponsor, 
            domainName, 
            domainInput, 
            domainInputFromTxnHash, 
            domainInputFromTxnIndex, 
            domainOutput, 
            timestamp
    ) {
        const that = this;
        that.version = version;
        that.uuid = uuid;
        that.business = business;
        that.type = type;
        that.sponsor = sponsor;
        that.domainName = domainName;
        that.domainInput = domainInput;
        that.domainInputDigest = utils.calculateHash(this.domainInput);
        that.domainInputFromTxnHash = domainInputFromTxnHash;
        that.domainInputFromTxnIndex = domainInputFromTxnIndex;
        that.domainOutput = domainOutput;
        that.domainOutputDigest = utils.calculateHash(this.domainOutput);
        that.timestamp = timestamp;
        Object.assign(this, that);
        this.signature = encrypt(SK, Buffer.from(JSON.stringify(that)));
    }
}

module.exports = Transaction;
