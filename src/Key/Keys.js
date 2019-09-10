const Elliptic = require('elliptic');
const buffer = require("buffer");
const EDDSA = Elliptic.eddsa('ed25519');
const pair1 = EDDSA.keyFromSecret(Elliptic.rand(32));
const pair2 = EDDSA.keyFromSecret(Elliptic.rand(32));
const pair3 = EDDSA.keyFromSecret(Elliptic.rand(32));
const pair4 = EDDSA.keyFromSecret(Elliptic.rand(32));
const pair5 = EDDSA.keyFromSecret(Elliptic.rand(32));
const fs = require('fs');

function B(data) {
    if (typeof data === 'string') {
        return buffer.Buffer.from(data, 'hex');
    }
    return buffer.Buffer.from(data);
}

const Keys = {
    "cn-0001": {
        "PK": B(pair1.getPublic()),
        "SK": B(pair1.getSecret())
    }, 
    "us-0001": {
        "PK": B(pair2.getPublic()),
        "SK": B(pair2.getSecret())
    },
    "uk-0001": {
        "PK": B(pair3.getPublic()),
        "SK": B(pair3.getSecret())
    },
    "fr-0001": {
        "PK": B(pair4.getPublic()),
        "SK": B(pair4.getSecret())
    },
    "ru-0001": {
        "PK": B(pair5.getPublic()),
        "SK": B(pair5.getSecret())
    }
}

fs.writeFile('./src/Key/Key.json', JSON.stringify(Keys), { 'flag': 'w' }, (err) => {
    if(err) {
        throw err;
    }
});

module.exports = Keys;
