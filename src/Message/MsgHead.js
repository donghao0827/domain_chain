class MsgHead {
    constructor(id, business, type, admin, timestamp) {
        this.id = id;
        this.business = business;
        this.type = type;
        this.admin = admin;
        this.timestamp = timestamp;
    }
}

module.exports = MsgHead;