var utils = require("../../public/Utils");
const { PK, SK } = require('../key/Key');
const { encrypt, decrypt } = require('../../public/rsa/RSA');

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