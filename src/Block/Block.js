var utils = require("../../public/Utils");

class Block {
   constructor(index, version, timestamp, merkle, previousHash = '', worldStateHash, txnCount, transactions) {
      const that = this;
      that.index = index;
      that.version = version;
      that.previousHash = previousHash;
      that.timestamp = timestamp;
      that.merkle = merkle;
      that.worldStateHash = worldStateHash;
      Object.assign(this, that);

      this.txnCount = txnCount;
      this.transactions = transactions;
      this.hash = utils.calculateHash(JSON.stringify(that));
   }
}

module.exports = Block;