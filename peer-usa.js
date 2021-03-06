const express = require('express');
const Peer = require('./src/Peer/Peer');
const Admin = require('./src/Admin/Admin');
const Transaction = require('./src/Transaction/Transaction');
const { domainInput, domainOutput } = require('./mock/domain');
const BlockChain = require('./src/BlockChain/BlockChain');
const MCL = [
    { id: "cn-0001", name: "China" },
    { id: "us-0001", name: "USA" },
    { id: "uk-0001", name: "UK" },
    { id: "ru-0001", name: "Russia" },
    { id: "fr-0001", name: "France" }
];
const rootZone = require('./mock/rootZone');
const worldState = require('./mock/worldState');

const DomainChain = new BlockChain();
const cnTxn = new Transaction(1, 1, 1, 1, { id: "cn-0001", name: "China", domain: ['cn'] }, "cn", [], "", -1, rootZone.cn, (new Date()).getTime());
const usTxn = new Transaction(1, 1, 1, 1, { id: "us-0001", name: "USA", domain: ['us'] }, "us", [], "", -1, rootZone.us, (new Date()).getTime());
const ukTxn = new Transaction(1, 1, 1, 1, { id: "uk-0001", name: "UK", domain: ['uk'] }, "uk", [], "", -1, rootZone.uk, (new Date()).getTime());
const frTxn = new Transaction(1, 1, 1, 1, { id: "fr-0001", name: "France", domain: ['fr'] }, "fr", [], "", -1, rootZone.fr, (new Date()).getTime());
const ruTxn = new Transaction(1, 1, 1, 1, { id: "ru-0001", name: "Russia", domain: ['ru'] }, "ru", [], "", -1, rootZone.ru, (new Date()).getTime());
const txns = [cnTxn, usTxn, ukTxn, frTxn, ruTxn];
DomainChain.createGenesisBlock(txns, worldState);


const p2 = new Peer(4000, 4001, { id: "us-0001", name: "USA", domain: ['us'] }, false, DomainChain, worldState);
p2.initP2PServer();
    
