const NodeRSA = require('node-rsa');
const fs = require('fs');
const key = new NodeRSA();

const keypair = key.generateKeyPair(512, 65537);
const PK = keypair.exportKey('public');
const SK = keypair.exportKey('private');
fs.writeFile('./src/key/public.pem', PK, { 'flag': 'w' }, (err) => {
    if(err) {
        throw err;
    }
});
fs.writeFile('./src/key/private.pem', SK, { 'flag': 'w' }, (err) => {
    if(err) {
        throw err;
    }
});

module.exports = { PK, SK };

