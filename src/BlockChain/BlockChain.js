const Utils = require('../../public/Utils');
const Block = require('../Block/Block');

class BlockChain{
    constructor() {
        this.chain = [];
    }
    createGenesisBlock(transactions, worldState) {
        const timestamp = (new Date()).getTime();
        const txnCount = transactions.length;
        const merkle = Utils.calculateMerkleRoot(transactions);  
        const worldStateHash = Utils.calculateHash(worldState);
        this.chain = [new Block(0, 1, timestamp, merkle, "", worldStateHash, txnCount, transactions)];
        return this.chain;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    addBlock(block) {
        this.chain.push(block);
        //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>', this.chain);
        return this.chain;
    }
    buildBlock(transactions, worldState) {
        const previousHash = this.getLatestBlock().hash;
        const merkle = Utils.calculateMerkleRoot(transactions);  
        const timestamp = (new Date()).getTime();
        const worldStateHash = Utils.calculateHash(JSON.stringify(worldState));
        const txnCount = transactions.length;
        const block = new Block(1, this.chain.length + 1, previousHash, merkle, timestamp, worldStateHash, txnCount, transactions);
        return block;
    }
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports = BlockChain;