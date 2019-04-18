const NodeRSA = require('node-rsa');
const fs = require('fs');


const key1 = new NodeRSA();
const key2 = new NodeRSA();
const key3 = new NodeRSA();
const key4 = new NodeRSA();
const key5 = new NodeRSA();

const keypair1 = key1.generateKeyPair(512, 65537);
const keypair2 = key2.generateKeyPair(512, 65537);
const keypair3 = key3.generateKeyPair(512, 65537);
const keypair4 = key4.generateKeyPair(512, 65537);
const keypair5 = key5.generateKeyPair(512, 65537);

const PK1 = keypair1.exportKey('public');
const SK1 = keypair1.exportKey('private');
const PK2 = keypair1.exportKey('public');
const SK2 = keypair1.exportKey('private');
const PK3 = keypair1.exportKey('public');
const SK3 = keypair1.exportKey('private');
const PK4 = keypair1.exportKey('public');
const SK4 = keypair1.exportKey('private');
const PK5 = keypair1.exportKey('public');
const SK5 = keypair1.exportKey('private');

fs.writeFile('./src/Key/cn-0001/public.pem', PK1, { 'flag': 'w' }, (err) => { if(err) { throw err; }});
fs.writeFile('./src/Key/cn-0001/private.pem', SK1, { 'flag': 'w' }, (err) => { if(err) { throw err; }});
fs.writeFile('./src/Key/us-0001/public.pem', PK2, { 'flag': 'w' }, (err) => { if(err) { throw err; }});
fs.writeFile('./src/Key/us-0001/private.pem', SK2, { 'flag': 'w' }, (err) => { if(err) { throw err; }});
fs.writeFile('./src/Key/uk-0001/public.pem', PK3, { 'flag': 'w' }, (err) => { if(err) { throw err; }});
fs.writeFile('./src/Key/uk-0001/private.pem', SK3, { 'flag': 'w' }, (err) => { if(err) { throw err; }});
fs.writeFile('./src/Key/fr-0001/public.pem', PK4, { 'flag': 'w' }, (err) => { if(err) { throw err; }});
fs.writeFile('./src/Key/fr-0001/private.pem', SK4, { 'flag': 'w' }, (err) => { if(err) { throw err; }});
fs.writeFile('./src/Key/ru-0001/public.pem', PK5, { 'flag': 'w' }, (err) => { if(err) { throw err; }});
fs.writeFile('./src/Key/ru-0001/private.pem', SK5, { 'flag': 'w' }, (err) => { if(err) { throw err; }});

const keys = {
    "cn-0001": {
        "PK": PK1,
        "SK":SK1 
    },
    "us-0001": {
        "PK": PK2,
        "SK":SK2 
    },
    "uk-0001": {
        "PK": PK3,
        "SK":SK3 
    },
    "fr-0001": {
        "PK": PK4,
        "SK":SK4 
    },
    "ru-0001": {
        "PK": PK5,
        "SK":SK5 
    }
}

module.exports = keys;

