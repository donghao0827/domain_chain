var utils = require("../../public/Utils");

class MsgPrePrepare {
    constructor(view, n, transaction) {
        this.view = view;
        this.n = n;
        this.transaction = transaction;
        this.txnDigest = utils.calculateHash(this.transaction);
    }
}

class MsgPrepare {
    constructor(view, n, txnResult) {
        this.view = view;
        this.n = n;
        this.txnResult = txnResult;
        this.txnResultDigest = utils.calculateHash(this.txnResult);
    }
}

class MsgCommit {
    constructor(view, n) {
        this.view = view;
        this.n = n;
    }
}

class MsgReply {
    constructor(view, n, txnDigest, txnResult) {
        this.view = view;
        this.n = n;
        this.txnDigest = txnDigest;
        this.txnResult = txnResult;
        this.txnResult = utils.calculateHash(this.txnResult);
    }
}

class MsgBlock {
    constructor(block, blockDigest, worldState, worldStateDigest, MCL, MCLDigest) {
        this.block = block;
        this.blockDigest = blockDigest;
        this.worldState = worldState;
        this.worldStateDigest = worldStateDigest;
        this.MCL = MCL;
        this.MCLDigest = MCL;
    }
}

module.exports = { MsgPrePrepare, MsgPrepare, MsgCommit, MsgReply, MsgBlock };