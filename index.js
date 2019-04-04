const express = require('express');
const Peer = require('./src/Peer/Peer');
const Admin = require('./src/Admin/Admin');
const Transaction = require('./src/Transaction/Transaction');
const { domainInput, domainOutput } = require('./mock/domain');

const p1 = new Peer(3000, 3001);
const p2 = new Peer(4000, 4001);
const p3 = new Peer(5000, 5001);
const p4 = new Peer(6000, 6001);
const p5 = new Peer(7000, 7001);
p1.initP2PServer();
p2.initP2PServer();
p3.initP2PServer();
p4.initP2PServer();
p5.initP2PServer();

p1.initHttpServer();
    
