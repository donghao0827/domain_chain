const Express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const Transaction = require('../Transaction/Transaction');
const Message = require('../Message/Message');
const MsgHead = require('../Message/MsgHead');
const { MsgPrePrepare, MsgPrepare, MsgCommit, MsgReply, MsgBlock } = require('../Message/MsgBody');
const utils = require("../../public/Utils");
const { PK, SK } = require('../key/Key');
const { encrypt, decrypt } = require('../../public/RSA/RSA');

class Peer {
    constructor(p2p_port, http_port, admin, isLeader, blockChain, worldState) {
        this.isLeader = isLeader || false;
        this.blockChain = blockChain;
        this.p2p_port = p2p_port;
        this.http_port = http_port;
        this.sockets = [];
        this.txnID = 0;
        this.msgID = 0;
        this.pbft_n = 0;
        this.blockID = 0;

        this.ppmsgQuene = [];
        this.pmsgQuene = [];
        this.cmsgQuene = [];
        this.rmsgQuene = [];

        this.tempTxnQueue = {};
        this.txnArray = [];

        this.admin = admin;
        this.MCL = [
            { id: "cn-0001", name: "China", domain: ['cn'] },
            { id: "us-0001", name: "USA", domain: ['us'] },
            { id: "uk-0001", name: "UK", domain: ['uk'] },
            { id: "fr-0001", name: "France", domain: ['fr'] },
            { id: "ru-0001", name: "Russia", domain: ['ru'] }
        ];
        this.tempMCL = [
            { id: "cn-0001", name: "China", domain: ['cn'] },
            { id: "us-0001", name: "USA", domain: ['us'] },
            { id: "uk-0001", name: "UK", domain: ['uk'] },
            { id: "fr-0001", name: "France", domain: ['fr'] },
            { id: "ru-0001", name: "Russia", domain: ['ru'] }
        ];
        this.view = 1;
        this.hostGroup = [
            '127.0.0.1:3000',
            '127.0.0.1:4000',
            '127.0.0.1:5000',
            '127.0.0.1:6000',
            '127.0.0.1:7000'
        ];
        this.router = {
            "cn-0001": "127.0.0.1:3000",
            "us-0001": "127.0.0.1:4000",
            "uk-0001": "127.0.0.1:5000",
            "ru-0001": "127.0.0.1:6000",
            "fr-0001": "127.0.0.1:7000",
        };
        this.worldState = JSON.parse(JSON.stringify(worldState));
        this.tempWorldState = JSON.parse(JSON.stringify(worldState));;
    }

    initKey() { //生成密钥对

    }

    initHttpServer() {//控制节点的HTTP服务器  类似节点操作
        var app = Express();
        app.use(bodyParser.json());
    
        app.get('/peers', (req, res) => {//获取显示网络中存在的节点，
            res.send(this.sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
        });

        app.get('/query', (req, res) => {//查询域名，
            if(req) {
                const queryName = req.query.query_name;
                res.send(this.worldState[queryName]);
            }
        });

        app.post('/txn', (req, res) => {
            if(req.body && req.body.sponsor) {
                const txn = this.buildTransaction(req.body);
                if(this.broadcast(this.hostGroup, txn)) {
                    console.log("Transaction has been broadcasted to other peers");
                }
                res.send("OK");
            } else {
                res.send("Error");
            }
        })

        app.get('/showtxn', (req, res) => {
            res.send(this.txnArray.map( item => item.id + ':' + item.sponsor));
        });
      
        app.get('/showblockchain', (req, res) => {
            res.send("blockchain" + this.blockChain.chain);
        });

        app.get('/showws', (req, res) => {
            res.send("worldstate" + JSON.stringify(this.worldState));
        });

        app.get('/showtempws', (req, res) => {
            res.send("tempworldstate" + JSON.stringify(this.tempWorldState));
        });
        
        app.get('/showmcl', (req, res) => {
            res.send(this.MCL.map( item => item.id + item.name + item.domain));
        });
    
        app.post('/addPeer', (req, res) => {//请求添加新的节点{"peer" : "ws://localhost:6001"}
            connectToPeers([req.body.peer]);//添加新节点
            res.send([req.body.peer]);
        });

        app.get('/', (req, res) => {
            hostGroup = [
                '127.0.0.1:4000',
                '127.0.0.1:5000',
                '127.0.0.1:6000',
                '127.0.0.1:7000'
            ];
            this.broadcast(hostGroup, JSON.stringify({message: "OK"}));
        });
    
        app.get('/blocks/all', (req, res) => {
            block_db.all(function (err, results) {
                res.json(results);
            });
        });
    
        app.post('/block', (req, res) => {//
            var text = req.body.text;
            var address = req.body.address;
            var publicKey = req.body.publicKey;
            var signedHex = req.body.signedHex;
    
            
            //检验
            if (verify_text(text, signedHex, publicKey)) {
                const des = crypto.encrypt(text);
                const texthash = crypto.hash(text);
                var data = {
                    destext:des.value,
                    deskey:des.key,
                    texthash: texthash,
                    address: address,
                    publicKey: publicKey,
                    signedHex: signedHex
                }
        
                add_a_block_to_blockchain(data,res);
    
                
            } else {
                res.send("error with verify text");
            }
            //
    
        });
    
        app.listen(this.http_port, () => console.log('Listening http on port: ' + this.http_port));//监听端口
    }

    initP2PServer() {
        const server = new WebSocket.Server({ port: this.p2p_port });
        server.on('connection', server => this.initConnection(server))
        console.log('listening websocket p2p port on: ' + this.p2p_port);
    }

    initConnection(ws) {//初始化连接
        this.initMessageReceiver(ws);//信息处理
        //this.sockets.push(ws);
        // initErrorHandler(ws);//错误状态处理
        //write(ws, blockchain[blockchain.length - 1]);//广播
        //write(ws, null);//广播
        console.log('new peer:' + ws._socket.remoteAddress + ':' + ws._socket.remotePort);
    };

    initMessageReceiver(ws) {//信息处理
        ws.on('message', (data) => {
            if (data) {
                const message = JSON.parse(data);
                this.distributeMessage(message);
            }
        });
    };

    send(host, msg) {
        const client = new WebSocket(`ws://${ host }`);
        client.on('open', () => {
            client.send(msg);
        });
    }

    broadcast(hostGroup, msg) {
        hostGroup.forEach( host => {
            const client = new WebSocket(`ws://${ host }`);
            client.on('open', () => {
                client.send(msg);
            });
        });
        return true;
    }

    //-----------------------------------------消息处理-----------------------------------------
    distributeMessage(msg) {
        const business = parseInt(msg.business) || 0;
        switch(business) {
            case 1: {
                console.log("get Transaction");
                const res = this.transactionHandler(msg);
                if(res) {
                    const ppmsg = this.buildPrePrepareMessage(msg, this.pbft_n);
                    this.broadcast(this.hostGroup, ppmsg);
                    this.pbft_n++;
                }
                break;
            };
            case 2: {
                console.log("get Message");
                this.PBFTHandler(msg);
                break;
            };
            case 3: {
                this.VRFQueue.push(msg);
                break;
            };
            case 4: {
                break;
            };
            case 5: {
                this.MCL = msg.MCL;
                this.admin = this.MCL[this.searchMCL(this.admin, this.MCL)];
                this.worldState = msg.worldState;
                this.blockChain.addBlock(msg.block)
                console.log('get blockchain!', this.blockChain);
                break;
            };
            default: {
                break;
            }
        }
    }

    transactionHandler(txn) {
        const sig = txn.signature;
        delete txn.signature;
        const tbuf = Buffer.from(JSON.stringify(txn));
        const verifyResult = this.verifySignature(tbuf, sig, PK);
        return verifyResult;
        
    }

    PBFTHandler(msg) {
        const type = msg.type;
        switch(type) {
            case 1: {
                console.log('get preprepare message');
                const num = msg.n;
                const txn = msg.transaction;
                const res = this.handlePrePrepare(msg);
                if(res && this.ppmsgQuene[num] && this.ppmsgQuene[num] - 1 < 4) {
                    this.ppmsgQuene[num]++;
                } else if(res && this.ppmsgQuene[num] && this.ppmsgQuene[num] - 1 >= 4) { 
                    this.tempTxnQueue[num] = txn;
                    console.log("55555555555555555555", this.tempMCL);
                    const txnResult = this.excuteTransaction(txn, this.tempWorldState, this.tempMCL);
                    const pmsg = this.buildPrepareMessage(num, txnResult);
                    this.broadcast(this.hostGroup, pmsg);
                    this.ppmsgQuene[num] = 0;
                }
                break;
            };
            case 2: {
                console.log('get prepare message');
                const num = msg.n;
                const res = this.handlePrepare(msg);
                if(res && this.pmsgQuene[num] && this.pmsgQuene[num] - 1 < 4) {
                    this.pmsgQuene[num]++;
                } else if(res && this.pmsgQuene[num] && this.pmsgQuene[num] - 1 >= 4) {
                    const cmsg = this.buildCommitMessage(num);
                    this.broadcast(this.hostGroup, cmsg);
                    this.pmsgQuene[num] = 0; 
                }
                break;
            };
            case 3: {
                console.log('get commit message');
                const num = msg.n;
                const res = this.handleCommit(msg);
                const domainName = this.tempTxnQueue[num].domainName;
                const sponsor = this.tempTxnQueue[num].sponsor;
                if(res && this.cmsgQuene[num] && this.cmsgQuene[num] - 1 < 4) {
                    this.cmsgQuene[num]++;
                } else if(res && this.cmsgQuene[num] && this.cmsgQuene[num] - 1 >= 4) {
                    const dstHost = this.router[sponsor.id];
                    this.txnArray.push(this.tempTxnQueue[num]);
                    const rmsg = this.buildReplyMessage(num);
                    this.send(dstHost, rmsg);
                    delete this.tempTxnQueue[num];
                    this.cmsgQuene[num] = 0; 
                }
                if(this.isLeader&&this.txnArray&&this.txnArray.length&&this.txnArray.length >= 2) {
                    const newBlock = this.blockChain.buildBlock(this.txnArray, this.worldState);
                    this.MCL = this.tempMCL;
                    this.worldState = this.tempWorldState;
                    const bmsg = this.buildBlockMessage(newBlock, this.worldState, this.MCL)
                    this.broadcast(this.hostGroup, bmsg);
                    this.txnArray = [];
                    this.tempMCL = JSON.parse(JSON.stringify(this.MCL));
                }
                break;
            }
            case 4: {
                console.log('get reply message');
                break;
            }
            default: {
                break;
            }
        }
    }

    handlePrePrepare(ppmsg) {
        const sig = ppmsg.signature;
        delete ppmsg.signature;
        const ppbuf = Buffer.from(JSON.stringify(ppmsg));
        const leader = ppmsg.admin;
        const num = ppmsg.n;
        const transaction = ppmsg.transaction;
        const txnDigest = ppmsg.txnDigest
        if(this.ppmsgQuene[num] === undefined) this.ppmsgQuene[num] = 1;

        const verifySignResult = this.verifySignature(ppbuf, sig, PK);
        const verifyIdentityResult = this.verifyIdentity(leader, this.MCL);
        const verifyDigestResult = this.verifyDigest(transaction, txnDigest);
        const verifySponsorResult = this.verifySponsor(transaction);
        console.log("-------------------------", verifySignResult, verifyIdentityResult, verifyDigestResult, verifySponsorResult);
        const verifyResult = verifySignResult && verifyIdentityResult && verifyDigestResult && verifySponsorResult;
        return verifyResult;
    }

    handlePrepare(pmsg) {
        const sig = pmsg.signature;
        delete pmsg.signature;
        const pbuf = Buffer.from(JSON.stringify(pmsg));
        const num = pmsg.n;
        const responser = pmsg.admin;
        const txnResult = pmsg.txnResult;
        const txnResultDigest = pmsg.txnResultDigest;
        if(this.pmsgQuene[num] === undefined) this.pmsgQuene[num] = 1;

        const verifySignResult = this.verifySignature(pbuf, sig, PK);
        const verifyIdentityResult = this.verifyIdentity(responser, this.MCL);
        const verifyDigestResult = this.verifyDigest(txnResult, txnResultDigest);
        console.log("-------------------------", verifySignResult, verifyIdentityResult, verifyDigestResult);
        const verifyResult = verifySignResult && verifyIdentityResult && verifyDigestResult;
        return verifyResult;
    }

    handleCommit(cmsg) {
        const sig = cmsg.signature;
        delete cmsg.signature;
        const num = cmsg.n;
        const cbuf = Buffer.from(JSON.stringify(cmsg));
        if(this.cmsgQuene[num] === undefined) this.cmsgQuene[num] = 1;

        const verifySignResult = this.verifySignature(cbuf, sig, PK);
        const verifyResult = verifySignResult;
        return verifyResult;
    }

    handleReply() {

    }

    verifySignature(InfoBuffer, signature, PK) {
        const InfoBufferDecrypt = decrypt(PK, signature);
        const InfoBufferDecryptHash = utils.calculateHash(InfoBufferDecrypt); 
        const txnInfoBufferHash = utils.calculateHash(InfoBuffer);
        return InfoBufferDecryptHash === txnInfoBufferHash;
    }

    verifyIdentity(signer, MCL) {
        const stringMCL = MCL.map((item) => {
            return utils.calculateHash(JSON.stringify(item));
        });
        console.log('???????????????????', signer, MCL);
        return stringMCL.indexOf(utils.calculateHash(JSON.stringify(signer))) !== -1;
    }

    verifySponsor(txn) {
        const domainType = txn.type;
        if(domainType === 1) {
            return true;
        } else if(domainType === 2 || domainType === 3) {
            const sponsor = txn.sponsor;
            const domainName = txn.domainName;
            // console.log('++++++++++++++++++++++', domainName, sponsor, this.MCL, this.MCL[this.searchMCL(sponsor, this.MCL)].domain);
            return this.MCL[this.searchMCL(sponsor, this.MCL)].domain.indexOf(domainName) !== -1;
        }
    }

    verifyDigest(Info, InfoDigest) {
        const InfoHash = utils.calculateHash(Info);
        return InfoHash === InfoDigest;
    }

    //-----------------------------------------执行交易-----------------------------------------
    excuteTransaction(txn, worldState, MCL) {
        let txnResult = null;
        const sponsor = txn.sponsor;
        const domainName = txn.domainName;
        const domainOutput = txn.domainOutput;
        // console.log("qqqqqqqqqqqqqqqqqqqqqqqq", sponsor, domainName, domainOutput, MCL);
        if(!worldState[domainName]) {
            txnResult = this.handleDomainOutput(domainName, domainOutput);
            this.tempWorldState[domainName] = txnResult;
            // console.log("xxxxxxxxxxxxxxxxxxxxxx", sponsor, MCL);
            MCL[this.searchMCL(sponsor, MCL)].domain.push(domainName);
        } else {
            txnResult = this.handleDomainOutput(domainName, domainOutput);
            this.tempWorldState[domainName] = txnResult;
        }
        return txnResult;
    }

    handleDomainOutput(domainName, DomainOutput) {
        if(DomainOutput.length === 0) {
            return null;
        }
        const len = DomainOutput.length;
        let authRecords = [];
        let extraRecords = [];
        for(let i = 0; i < len; i++) {
            (DomainOutput[i].Name === domainName) ? authRecords.push(DomainOutput[i]) : extraRecords.push(DomainOutput[i]);   
        }
        return {
            Auth_count: authRecords.length,
            Extra_count: extraRecords.length,
            Auth_details: authRecords.map( item => {
                return {
                    Name: item.Name,
                    Type: item.Type,
                    Class: item.Class,
                    TTL: item.TTL,
                    RData: {
                        Name_server: item.Value
                    }
                }
            }),
            Extra_details: extraRecords.map( item => {
                return {
                    Name: item.Name,
                    Type: item.Type,
                    Class: item.Class,
                    TTL: item.TTL,
                    RData: {
                        Addr: item.Value
                    }
                }
            })
        };
    }

    //-----------------------------------------构建交易-----------------------------------------
    buildTransaction(msg) {
        const version = 1;
        const business = 1;
        const type = msg.domainType || 0;
        const sponsor = msg.sponsor || {};
        const domainName = msg.domainName || "";
        const domainInput = msg.domainInput || [];
        const domainInputFromTxnHash = msg.domainInputFromTxnHash || "";
        const domainInputFromTxnIndex = msg.domainInputFromTxnIndex || -1;
        const domainOutput = msg.domainOutput || [];
        const timestamp = (new Date()).getTime();
        const txn = new Transaction(version, this.txnID, business, type, sponsor, domainName, domainInput, domainInputFromTxnHash, domainInputFromTxnIndex, domainOutput, timestamp);
        this.txnID++;
        return JSON.stringify(txn);
    }

    buildPrePrepareMessage(txn, n) {
        const business = 2;
        const type = 1;
        const timestamp = (new Date()).getTime();
        const view = this.view;
        const number = n;
        const transaction = txn;

        const mh = new MsgHead(this.msgID, business, type, this.admin, timestamp);
        const mb = new MsgPrePrepare(view, number, transaction);
        const ppmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(ppmsg);
    }

    buildPrepareMessage(num, txnResult) {
        const business = 2;
        const type = 2;
        const timestamp = (new Date()).getTime();
        const view = this.view;
        const n = num;
        const transactionResult = txnResult;

        const mh = new MsgHead(this.msgID, business, type, this.admin, timestamp);
        const mb = new MsgPrepare(view, n, transactionResult);
        const pmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(pmsg);
    }

    buildCommitMessage(num) {
        const business = 2;
        const type = 3;
        const timestamp = (new Date()).getTime();
        const view = this.view;
        const n = num;

        const mh = new MsgHead(this.msgID, business, type, this.admin, timestamp);
        const mb = new MsgCommit(view, n);
        const cmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(cmsg);
    }

    buildReplyMessage(num) {
        const business = 2;
        const type = 4;
        const timestamp = (new Date()).getTime();
        const view = this.view;
        const n = num;

        const currentTxn = this.tempTxnQueue[num];
        const domainName = currentTxn.domainName;
        const txnResult = this.worldState[domainName];

        const mh = new MsgHead(this.msgID, business, type, this.admin, timestamp);
        const mb = new MsgReply(view, n, utils.calculateHash(JSON.stringify(currentTxn)), txnResult);
        const rmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(rmsg);

    }

    buildBlockMessage(block, worldState, MCL) {
        const id = this.blockID;
        const business = 5; 
        const type = 1;
        const timestamp = (new Date()).getTime();
        const admin = this.admin;
        
        const mh = new MsgHead(id, business, type, admin, timestamp);
        const mb = new MsgBlock(block, utils.calculateHash(JSON.stringify(block)), worldState, utils.calculateHash(worldState), MCL, utils.calculateHash(MCL));
        const bmsg = new Message(mh, mb);
        this.blockID++;
        return JSON.stringify(bmsg);
    }

    //-----------------------------------------检索管理认证列表-----------------------------------------
    searchMCL(sponsor, MCL) {
        //console.log("<<<<<<<<<<<<<<<<<<<", sponsor, MCL);
        const id = sponsor.id;
        let index = 0;
        for (const i of MCL) {
            if(id === i.id) {
                index = MCL.indexOf(i);
            }
        }
        return  index;
    }
}

module.exports = Peer;