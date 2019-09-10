const NodeRSA = require('node-rsa');
var utils = require("../../public/Utils");
const encrypt = function(SK, msg) {
    const key = new NodeRSA();
    key.importKey(SK, "private")
    return key.encryptPrivate(msg, 'buffer');
}

const decrypt = function(PK, cip) {
    const key = new NodeRSA();
    key.importKey(PK, "public");
    return key.decryptPublic(cip, 'buffer');
}

module.exports = { encrypt, decrypt };