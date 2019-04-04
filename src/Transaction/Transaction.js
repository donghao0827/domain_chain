var utils = require("../../public/Utils");
const { PK, SK } = require('../key/Key');
const { encrypt, decrypt } = require('../../public/rsa/RSA');
// const cipher = encrypt(SK, Buffer.from('11'));
// console.log(decrypt(PK, cipher));

class Transaction {
    constructor(version, uuid, business, type, sponsor, domainName, domainType, domainInput, domainOutput, timestamp) {
        const that = this;
        that.version = version;
        that.uuid = uuid;
        that.business = business;
        that.type = type;
        that.sponsor = sponsor;
        that.domainName = domainName;
        that.domainType = domainType;
        that.domainInput = domainInput;
        that.domainInputDigest = utils.calculateHash(this.domainInput);
        that.domainOutput = domainOutput;
        that.domainOutputDigest = utils.calculateHash(this.domainOutput);
        that.timestamp = timestamp;
        Object.assign(this, that);
        this.signature = encrypt(SK, Buffer.from(JSON.stringify(that)));
    }
}

module.exports = Transaction;