var utils = require("../../public/Utils");
const keys = require('../Key/Key');
const { encrypt, decrypt } = require('../../public/RSA/RSA');

class Transaction {
    constructor(
            version, 
            uuid, 
            business, 
            type, 
            sponsor, 
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
        const SK = keys[that.sponsor.id].SK
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
