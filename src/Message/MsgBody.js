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
        this.txnResultDigest = utils.calculateHash(this.txnResult);
    }
}

class MsgBlock {
    constructor(block, blockDigest, worldState, worldStateDigest, MCL, MCLDigest) {
        this.block = block;
        this.blockDigest = blockDigest;
        this.worldState = worldState;
        this.worldStateDigest = worldStateDigest;
        this.MCL = MCL;
        this.MCLDigest = MCLDigest;
    }
}

//-----------------------------------------VRF消息体-----------------------------------------
class MsgVote {
    constructor(view, ballot, ballotDigest) {
        this.view = view;
        this.ballot = ballot;
        this.ballotDigest = ballotDigest;
    }
}

class MsgVoteResult {
    constructor(view, ballots, ballotsDigest, newLeader) {
        this.view = view;
        this.ballots = ballots;
        this.ballotsDigest = ballotsDigest;
        this.newLeader = newLeader;
    }
}

class MsgVoteAck {
    constructor(view) {
        this.view = view;
    }
}

//-----------------------------------------ViewChange消息体-----------------------------------------
class MsgChangeViewRequest {
    constructor(view) {
        this.view = view;
    }
}

class MsgChangeViewResponse {
    constructor(view) {
        this.view = view;
    }
}

class MsgChangeViewAck {
    constructor(view) {
        this.view = view;
    }
}

class MsgNewView {
    constructor(view) {
        this.view = view;
    }
}

class MsgNewViewAck {
    constructor(view) {
        this.view = view;
    }
}

class MsgChangeView {
    constructor(view) {
        this.view = view;
    }
}


module.exports = { 
    MsgPrePrepare, 
    MsgPrepare, 
    MsgCommit,
    MsgReply,
    MsgBlock, 
    MsgVote, 
    MsgVoteResult,
    MsgVoteAck, 
    MsgChangeView
};