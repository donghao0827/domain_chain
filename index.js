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

const cnTxn = new Transaction(1, 1, 1, 1, { id: "cn-0001", name: "China", domain:['cn']}, "cn", [], "", -1, rootZone.cn, (new Date()).getTime());
const usTxn = new Transaction(1, 1, 1, 1, { id: "us-0001", name: "USA", domain: ['us'] }, "us", [], "", -1, rootZone.us, (new Date()).getTime());
const ukTxn = new Transaction(1, 1, 1, 1, { id: "uk-0001", name: "UK", domain: ['uk'] }, "uk", [], "", -1, rootZone.uk, (new Date()).getTime());
const frTxn = new Transaction(1, 1, 1, 1, { id: "fr-0001", name: "France", domain: ['fr'] }, "fr", [], "", -1, rootZone.fr, (new Date()).getTime());
const ruTxn = new Transaction(1, 1, 1, 1, { id: "ru-0001", name: "Russia", domain: ['ru'] }, "ru", [], "", -1, rootZone.ru, (new Date()).getTime());
const txns = [cnTxn, usTxn, ukTxn, frTxn, ruTxn];

const DomainChain1 = new BlockChain();
DomainChain1.createGenesisBlock(txns, worldState);
const DomainChain2 = new BlockChain();
DomainChain2.createGenesisBlock(txns, worldState);
const DomainChain3 = new BlockChain();
DomainChain3.createGenesisBlock(txns, worldState);
const DomainChain4 = new BlockChain();
DomainChain4.createGenesisBlock(txns, worldState);
const DomainChain5 = new BlockChain();
DomainChain5.createGenesisBlock(txns, worldState);



const p1 = new Peer(3000, 3001,  {id: "cn-0001", name: "China", domain:['cn']}, true, DomainChain1, worldState);
const p2 = new Peer(4000, 4001,  {id: "us-0001", name: "USA", domain: ['us']}, false, DomainChain2, worldState);
const p3 = new Peer(5000, 5001,  {id: "uk-0001", name: "UK", domain: ['uk']}, false, DomainChain3, worldState);
const p4 = new Peer(6000, 6001,  {id: "fr-0001", name: "France", domain: ['fr']}, false, DomainChain4, worldState);
const p5 = new Peer(7000, 7001,  {id: "ru-0001", name: "Russia", domain: ['ru']}, false, DomainChain5, worldState);
p1.initP2PServer();
p2.initP2PServer();
p3.initP2PServer();
p4.initP2PServer();
p5.initP2PServer();

p1.initUDPServer();

p1.initHttpServer();
    
