var utils = require("../../public/Utils");
const { PK, SK } = require('../Key/Key');
const { encrypt, decrypt } = require('../../public/RSA/RSA');

class Message {
    constructor(msghead, msgbody){
        const that = {...msghead, ...msgbody};
        Object.assign(this, that);
        this.signature = encrypt(
            SK,
            Buffer.from(JSON.stringify(that))
        );
    }
}

module.exports = Message;
