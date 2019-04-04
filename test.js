const Message = require('./src/Message/Message');
const MsgHead = require('./src/Message/MsgHead');
const { MsgPrePrepare } = require('./src/Message/MsgBody');
const utils = require("./public/Utils");
const { PK, SK } = require('./src/Key/Key');
const { encrypt, decrypt } = require('./public/RSA/RSA');
const NodeRSA = require('node-rsa');

const business = 2;
const type = 1;
const timestamp = (new Date()).getTime();
const view = 1;
const number = 1;
const transaction = {};

const mh = new MsgHead(1, business, type, {id: "cn-0001", name: "China"}, timestamp);
const mb = new MsgPrePrepare(view, number, transaction);
const ppmsg = new Message(mh, mb);
const cip = Buffer.from('Le+gPl9WJhnuaGfm9eyPMDyOAXP1+ceABD1dpfRY+EH/p5lHaDXMbXY/ToNOQzKCg7+QpT2ZAkxCT2tGS7jJ+w==');
const msg = decrypt(PK, 'Le+gPl9WJhnuaGfm9eyPMDyOAXP1+ceABD1dpfRY+EH/p5lHaDXMbXY/ToNOQzKCg7+QpT2ZAkxCT2tGS7jJ+w==');

// const key1 = new NodeRSA();
// key1.importKey(PK, "public");
// const key2 = new NodeRSA();
// key2.importKey(PK, "public");
// const key3 = new NodeRSA();
// key3.importKey(PK, "public");

// console.log(utils.calculateHash(key1) === utils.calculateHash(key2));