const Express = require('express');
const WebSocket = require('ws');
const dgram = require('dgram');
const bodyParser = require('body-parser');
const Transaction = require('../Transaction/Transaction');
const Message = require('../Message/Message');
const MsgHead = require('../Message/MsgHead');
const { MsgChangeView, MsgPrePrepare, MsgPrepare, MsgCommit, MsgReply, MsgBlock, MsgVote, MsgVoteResult, MsgVoteAck } = require('../Message/MsgBody');
const utils = require("../../public/Utils");
const keys = require('../Key/Key');
const { encrypt, decrypt } = require('../../public/RSA/RSA');
const fs = require('fs');
const { ecvrf } = require('vrf.js');
const Keys = require('../Key/Key.json');
const TXNNUM = 2; // 定义产生多少交易可生成一个区块

class Peer {
    constructor(p2p_port, http_port, admin, isLeader, blockChain, worldState) {
        this.blockChain = blockChain;
        this.p2p_port = p2p_port;
        this.http_port = http_port;
        this.leader = {id: "cn-0001", name: "China", domain:['cn']};
        this.isLeader = isLeader || false;
        this.tempLeader = {};
        this.PK = Keys[this.leader.id].PK;
        this.SK = Keys[this.leader.id].SK;
        this.sockets = [];
        this.txnID = 0;
        this.msgID = 0;
        this.pbft_n = 0;
        this.vrf_n = 0;
        this.vc_n = 0;
        this.blockID = 0;

        this.ppmsgQuene = [];
        this.pmsgQuene = [];
        this.cmsgQuene = [];
        this.rmsgQuene = [];

        this.cvqmsgQuene = [];
        this.cvrmsgQuene = [];
        this.cvamsgQuene = [];
        this.nvmsgQuene = [];
        this.nvamsgQuene = [];
        
        this.vmsgQuene = [];
        this.vrmsgQuene = [];
        this.vamsgQuene = [];
        this.vrfBallots = [];

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
        this.view = 5;
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

    initUDPServer() {
        const udp_server = dgram.createSocket('udp4');
        udp_server.bind(53); // 绑定端口

        // 监听端口
        udp_server.on('listening', function () {
            console.log('udp server linstening 53.');
        })

        //接收消息
        udp_server.on('message', function (msg, rinfo) {
            const messageID = msg.slice(0, 2).readInt16BE(0);
            const flag = msg.slice(2, 12);
            const dataleft = msg.slice(12);
            let i = 0;
            let domainArray = [];
            while (dataleft[i] !== 0) {
                const len = dataleft[i];
                const domain = dataleft.slice(i + 1, len + i + 1);
                domainArray.push(domain);
                i = i + len + 1;
            } 
            const domainName = domainArray.map((item)=>{
                return item.toString();
            }).join('.');
            const tldName = domainArray[domainArray.length - 1].toString();
            console.log(this.worldState[tldName]);
            //udp_server.send();
            //console.log(">>>>>>>>>>>>", msg.slice(2));
        }.bind(this))
        //错误处理
        udp_server.on('error', function (err) {
            console.log('some error on udp server.')
            udp_server.close();
        })
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
                const hashInBlock = this.blockChain.getLatestBlock().worldStateHash;
                const hashOfCurrent = utils.calculateHash(this.worldState);
                const response = {
                    Code: 10000,
                    Msg: "success",
                    Data: this.worldState[queryName]
                }
                if(hashInBlock === hashOfCurrent)
                {
                    res.send(response);
                } else {
                    res.send("the worldState is bad");
                }
            }
        });

        app.post('/txn', (req, res) => {
            if(req.body && req.body.sponsor) {
                res.send("OK");
                const txn = this.buildTransaction(req.body);
                this.send(this.router[this.leader.id], txn).then((status) => {
                    if(status) {
                        console.log(">>>>>>>>>>>>>starttime", (new Date()).getTime());
                        console.log("Transaction has been broadcasted to other peers");  
                    } else {
                        const cvrmsg = this.buildChangeViewRequest();
                        this.broadcast(this.hostGroup, cvrmsg);
                        this.broadcast(this.hostGroup, cvrmsg);
                        this.broadcast(this.hostGroup, cvrmsg);
                        this.broadcast(this.hostGroup, cvrmsg);
                        this.broadcast(this.hostGroup, cvrmsg);
                    }
                })
            } else {
                res.send("Error");
            }
        })

        app.post('/startvrf', (req, res) => {
            console.log("----------------------Begin Vote----------------------");
            this.broadcast(this.hostGroup, JSON.stringify({ "business": 2 ,"type": 7 })); 
        })

        app.get('/showtxn', (req, res) => {
            res.send(JSON.stringify(this.txnArray));
        });
      
        app.get('/showblockchain', (req, res) => {
            res.send(JSON.stringify(this.blockChain.chain));
        });

        app.get('/showws', (req, res) => {
            res.send(JSON.stringify(this.worldState));
        });

        app.get('/showtempws', (req, res) => {
            res.send(JSON.stringify(this.tempWorldState));
        });
        
        app.get('/showmcl', (req, res) => {
            res.send(JSON.stringify(this.MCL));
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
        this.initMessageReceiver(ws); //信息处理
        //this.sockets.push(ws);
        // initErrorHandler(ws);//错误状态处理
        //write(ws, blockchain[blockchain.length - 1]);//广播
        //write(ws, null);//广播
        //console.log('new peer:' + ws._socket.remoteAddress + ':' + ws._socket.remotePort);
    };

    initMessageReceiver(ws) {//信息处理
        ws.on('message', (data) => {
            if (data) {
                const message = JSON.parse(data);
                this.distributeMessage(message);
            }
        });
    };

    initKey() {

    }

    send(host, msg) {
        const client = new WebSocket(`ws://${ host }`);
        return new Promise((resolve, reject) => {
            client.onerror = function() {
                resolve.call(undefined, false);
            };
            client.on('open', () => {
                client.send(msg);
                resolve.call(undefined, true);
            });
        }).catch((error) => {
            console.error(error);
        })
    }

    broadcast(hostGroup, msg) {
        hostGroup.forEach( host => {
            const client = new WebSocket(`ws://${ host }`);
            client.onerror = function() {
                console.log('Connection Error');
            };
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
                console.log("----------------------Get Transaction----------------------");
                const type = msg.type;
                const domainType = msg.domainType;
                switch(domainType) {
                    case 1: { console.log("Register New Domain"); break };
                    case 2: { console.log("Update Domain"); break };
                    case 3: { console.log("Cancel Domain"); break };
                    default: break;
                }
                const res = this.transactionHandler(msg);
                if(res) {
                    const ppmsg = this.buildPrePrepareMessage(msg, this.pbft_n);
                    this.broadcast(this.hostGroup, ppmsg);
                    this.pbft_n++;
                }
                break;
            };
            case 2: {
                this.PBFTHandler(msg);
                break;
            };
            case 3: {
                this.VRFHandler(msg);
                break;
            };
            case 4: {
                break;
            };
            case 5: {
                this.MCL = msg.MCL;
                this.admin = this.MCL[this.searchMCL(this.admin, this.MCL)];
                this.worldState = msg.worldState;
                fs.writeFile('./worldState.json', JSON.stringify(this.worldState), function(err){
                    if(err) console.log('写文件操作失败');
                    else console.log('写文件操作成功');
                });
                this.blockChain.addBlock(msg.block)
                console.log('Create New Blockchain!');
                break;
            };
            default: {
                break;
            }
        }
    }

    transactionHandler(txn) {
        const sig = txn.signature;
        const sponsor = txn.sponsor;
        delete txn.signature;
        const PK = keys[sponsor.id].PK;
        const tbuf = Buffer.from(JSON.stringify(txn));
        const verifySignResult = this.verifySignature(tbuf, sig, PK);
        if(!verifySignResult) { console.log("signature fail"); }
        return verifySignResult;      
    }

    PBFTHandler(msg) {
        const type = msg.type;
        switch(type) {
            case 1: {
                console.log('Get Preprepare Message');
                const num = msg.n;
                const txn = msg.transaction;
                const res = this.handlePrePrepare(msg);
                if(res) {
                    this.tempTxnQueue[num] = txn;
                    const txnResult = this.excuteTransaction(txn, this.tempWorldState, this.tempMCL);
                    const pmsg = this.buildPrepareMessage(num, txnResult);
                    this.broadcast(this.hostGroup, pmsg);
                    console.log("----------------------Finish Preprepare Section----------------------");
                }
                break;
            };
            case 2: {
                console.log('Get Prepare Message');
                const num = msg.n;
                const res = this.handlePrepare(msg);
                if(res && this.pmsgQuene[num] && this.pmsgQuene[num] < 4) {
                    this.pmsgQuene[num]++;
                } else if(res && this.pmsgQuene[num] && this.pmsgQuene[num] >= 4) {
                    const cmsg = this.buildCommitMessage(num);
                    this.broadcast(this.hostGroup, cmsg);
                    console.log("----------------------Finish Prepare Section----------------------");
                    this.pmsgQuene[num] = 0; 
                }
                break;
            };
            case 3: {
                console.log('Get Commit Message');
                const num = msg.n;
                const res = this.handleCommit(msg);
                if(res && this.cmsgQuene[num] && this.cmsgQuene[num] < 4) {
                    this.cmsgQuene[num]++;  
                } else if(res && this.cmsgQuene[num] && this.cmsgQuene[num] >= 4) {
                    const domainName = this.tempTxnQueue[num].domainName;
                    const sponsor = this.tempTxnQueue[num].sponsor;
                    const dstHost = this.router[sponsor.id];
                    this.txnArray.push(this.tempTxnQueue[num]);
                    const rmsg = this.buildReplyMessage(num);
                    this.send(dstHost, rmsg);
                    delete this.tempTxnQueue[num];
                    console.log("----------------------Finish Commit Section----------------------");
                    this.cmsgQuene[num] = 0; 
                }
                if(this.leader.id === this.admin.id &&this.txnArray&&this.txnArray.length&&this.txnArray.length >= TXNNUM) {
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
                console.log('End of Agreement');
                console.log(">>>>>>>>>>>>>endtime", (new Date()).getTime());
                break;
            }
            case 6: {
                console.log('Get View Change Request Message');
                //加入验证是否需要视图更新
                const res = this.handleChangeViewRequest(msg);
                const num = this.vc_n;
                if(res && this.cvqmsgQuene[num] && this.cvqmsgQuene[num] < 4) {
                    this.cvqmsgQuene[num]++;
                }
                else if(res && this.cvqmsgQuene[num] && this.cvqmsgQuene[num] >= 4) {
                    const cvrmsg = this.buildChangeViewResponse();
                    this.broadcast(this.hostGroup, cvrmsg);
                    console.log("----------------------Finish View Change Request Section----------------------");
                    this.cvqmsgQuene[num] = 0;
                }
                break;
            }
            case 7: {
                console.log('Get View Change Response Message');
                const res = this.handleChangeViewResponse(msg);
                const num = this.vc_n;
                if(res && this.cvrmsgQuene[num] && this.cvrmsgQuene[num] < 4) {
                    this.cvrmsgQuene[num]++;
                }
                if(res && this.cvrmsgQuene[num] && this.cvrmsgQuene[num] >= 4) {
                    const cvamsg = this.buildChangeViewAck();
                    this.send(this.router["cn-0001"], cvamsg);
                    console.log("----------------------Finish View Change Response Section----------------------");
                    this.cvrmsgQuene[num] = 0;
                    
                    const vmsg = this.buildVote();
                    this.broadcast(this.hostGroup, vmsg);
                    console.log("----------------------Start Vote----------------------");
                }
                break;
            }
            case 8: {
                console.log('Get View Change Ack Message');
                const res = this.handleChangeViewAck(msg);
                const num = this.vc_n;
                const newLeader = this.tempLeader;
                if(res && this.cvamsgQuene[num] && this.cvamsgQuene[num] < 4) {
                    this.cvamsgQuene[num]++;
                }
                if(res && this.cvamsgQuene[num] && this.cvamsgQuene[num] >= 4) {
                    const nvmsg = this.buildNewView();
                    this.broadcast(this.hostGroup, nvmsg);
                    console.log("----------------------Finish View Change Ack Section----------------------");
                    this.cvamsgQuene[num] = 0;
                }
                break;
            }
            case 9: {
                console.log('Get New View Message');
                const res = this.handleNewView(msg);
                if(res) {
                    const nvcmsg = this.buildNewViewAck();
                    this.broadcast(this.hostGroup, nvcmsg);
                    console.log("----------------------Finish New View Section----------------------");
                }
                break;
            }
            case 10: {
                console.log('Get New View Ack Message');
                const res = this.handleNewViewAck(msg);
                const num = this.vc_n;
                if(res && this.nvamsgQuene[num] && this.nvamsgQuene[num] < 4) {
                    this.nvamsgQuene[num]++;
                }
                if(res && this.nvamsgQuene[num] && this.nvamsgQuene[num] >= 4) {
                    this.leader = this.tempLeader;
                    console.log("End of ViewChange");
                    console.log("the New Leader is ", this.leader);
                }
                break;
            } 
            default: {
                break;
            }
        }
    }

    VRFHandler(msg) {
        const type = msg.type;
        const num = this.vrf_n;
        switch(type) {
            case 1: {
                console.log("Get Vote Message");
                console.log("Ballot:", msg.ballot.value.data.slice(8, 16), "......");
                const res = this.handleVote(msg);
                if(res && this.vmsgQuene[num] && this.vmsgQuene[num] < 4) {
                    this.vmsgQuene[num]++;
                } else if(res && this.vmsgQuene[num] && this.vmsgQuene[num] >= 4) {
                    const vrmsg = this.buildVoteResult();
                    this.broadcast(this.hostGroup, vrmsg);
                    console.log("----------------------Finish VRF Vote Section----------------------");
                    this.vmsgQuene[num] = 0; 
                }
                break;
            }
            case 2: {
                console.log("Get Vote Result Message");
                const res = this.handleVoteResult(msg);
                if(res && this.vrmsgQuene[num] && this.vrmsgQuene[num] < 4) {
                    this.vrmsgQuene[num]++;
                } else if(res && this.vrmsgQuene[num] && this.vrmsgQuene[num] >= 4) {
                    const vamsg = this.buildVoteAck();
                    this.broadcast(this.hostGroup, vamsg);
                    console.log("----------------------Finish VRF Vote Result Section----------------------");
                    this.vrmsgQuene[num] = 0; 
                }
                break;
            }
            case 3: {
                console.log("Get Vote Ack Message");
                const res = this.handleVoteAck(msg);
                if(res && this.vamsgQuene[num] && this.vamsgQuene[num] < 4) {
                    this.vamsgQuene[num]++;
                } else if(res && this.vamsgQuene[num] && this.vamsgQuene[num] >= 4) {
                    console.log('----------------------New Leader Generated!\n New Leader is ', this.tempLeader.name, '----------------------');
                    this.vamsgQuene[num] = 0; 
                    this.vrf_n++;
                    const nvamsg = this.buildChangeViewAck();
                    this.send(this.router[this.tempLeader.id], nvamsg)
                }
                break;
            }
            default: {
                break;
            }
        }
    }


    //-----------------------------------------PBFT消息处理-----------------------------------------
    handlePrePrepare(ppmsg) {
        const sig = ppmsg.signature;
        delete ppmsg.signature;
        const ppbuf = Buffer.from(JSON.stringify(ppmsg));
        const leader = ppmsg.admin;
        const num = ppmsg.n;
        const transaction = ppmsg.transaction;
        const txnDigest = ppmsg.txnDigest
        if(this.ppmsgQuene[num] === undefined) this.ppmsgQuene[num] = 1;
        const PK = keys[leader.id].PK;
        const verifySignResult = this.verifySignature(ppbuf, sig, PK);
        if(!verifySignResult) { console.log("signature fail"); }
        const verifyIdentityResult = this.verifyIdentity(leader, this.MCL);
        const verifyDigestResult = this.verifyDigest(transaction, txnDigest);
        const verifySponsorResult = this.verifySponsor(transaction);
        
        const domainName = transaction.domainName;
        const sponsor = transaction.sponsor;
        const sponsorName = sponsor.name;
        if(!verifySponsorResult) { 
            console.log("illegal transaction"); 
            console.log(domainName, "isn't belong ", sponsorName); 
        }
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
        const PK = keys[responser.id].PK;
        const verifySignResult = this.verifySignature(pbuf, sig, PK);
        //if(!verifySignResult) { console.log("signature fail"); }
        const verifyIdentityResult = this.verifyIdentity(responser, this.MCL);
        const verifyDigestResult = this.verifyDigest(txnResult, txnResultDigest);
        const verifyResult = verifySignResult && verifyIdentityResult && verifyDigestResult;
        return verifyResult;
    }

    handleCommit(cmsg) {
        const sig = cmsg.signature;
        delete cmsg.signature;
        const num = cmsg.n;
        const sponsor = cmsg.admin;
        const cbuf = Buffer.from(JSON.stringify(cmsg));
        if(this.cmsgQuene[num] === undefined) this.cmsgQuene[num] = 1;
        const PK = keys[sponsor.id].PK;
        const verifySignResult = this.verifySignature(cbuf, sig, PK);
        if(!verifySignResult) { console.log("signature fail"); }
        const verifyResult = verifySignResult;
        return verifyResult;
    }

    handleReply() {

    }

    //-----------------------------------------ViewChange消息处理-----------------------------------------
    handleChangeViewRequest(cvqmsg) {
        const sig = cvqmsg.signature;
        delete cvqmsg.signature;
        const cvqbuf = Buffer.from(JSON.stringify(cvqmsg));
        const num = this.vc_n;
        if(this.cvqmsgQuene[num] === undefined) this.cvqmsgQuene[num] = 1;
        const sponsor = cvqmsg.admin;
        const PK = keys[sponsor.id].PK;
        const verifySignResult = this.verifySignature(cvqbuf, sig, PK);
        const verifyIdentity = this.verifyIdentity(sponsor, this.MCL);
        const verifyResult = verifySignResult && verifyIdentity;
        return verifyResult;
    }

    handleChangeViewResponse(cvrmsg) {
        const sig = cvrmsg.signature;
        delete cvrmsg.signature;
        const cvrbuf = Buffer.from(JSON.stringify(cvrmsg));
        const num = this.vc_n;
        if(this.cvrmsgQuene[num] === undefined) this.cvrmsgQuene[num] = 1;
        const sponsor = cvrmsg.admin;
        const PK = keys[sponsor.id].PK;
        const verifySignResult = this.verifySignature(cvrbuf, sig, PK);
        const verifyIdentity = this.verifyIdentity(sponsor, this.MCL);
        const verifyResult = verifySignResult && verifyIdentity;
        return verifyResult;
    }

    handleChangeViewAck(cvamsg) {
        const sig = cvamsg.signature;
        delete cvamsg.signature;
        const cvabuf = Buffer.from(JSON.stringify(cvamsg));
        const num = this.vc_n;
        if(this.cvamsgQuene[num] === undefined) this.cvamsgQuene[num] = 1;
        const sponsor = cvamsg.admin;
        const PK = keys[sponsor.id].PK;
        const verifySignResult = this.verifySignature(cvabuf, sig, PK);
        const verifyIdentity = this.verifyIdentity(sponsor, this.MCL);
        const verifyResult = verifySignResult && verifyIdentity;
        return verifyResult;
    }

    handleNewView(nvmsg) {
        const sig = nvmsg.signature;
        delete nvmsg.signature;
        const nvbuf = Buffer.from(JSON.stringify(nvmsg));
        const num = this.vc_n;
        if(this.nvmsgQuene[num] === undefined) this.nvmsgQuene[num] = 1;
        const sponsor = nvmsg.admin;
        const PK = keys[sponsor.id].PK;
        const verifySignResult = this.verifySignature(nvbuf, sig, PK);
        const verifyIdentity = this.verifyIdentity(sponsor, this.MCL);
        const verifyResult = verifySignResult && verifyIdentity;
        return verifyResult;
    }

    
    handleNewViewAck(nvamsg) {
        const sig = nvamsg.signature;
        delete nvamsg.signature;
        const nvabuf = Buffer.from(JSON.stringify(nvamsg));
        const num = this.vc_n;
        if(this.nvamsgQuene[num] === undefined) this.nvamsgQuene[num] = 1;
        const sponsor = nvamsg.admin;
        const PK = keys[sponsor.id].PK;
        const verifySignResult = this.verifySignature(nvabuf, sig, PK);
        const verifyIdentity = this.verifyIdentity(sponsor, this.MCL);
        const verifyResult = verifySignResult && verifyIdentity;
        return verifyResult;
    }

    //-----------------------------------------VRF消息处理-----------------------------------------
    handleVote(vmsg) {
        const sig = vmsg.signature;
        delete vmsg.signature;
        const ballot = vmsg.ballot;
        const vbuf = Buffer.from(JSON.stringify(vmsg));
        const num = this.vrf_n;
        if(this.vmsgQuene[num] === undefined) this.vmsgQuene[num] = 1;
        const data = JSON.parse(JSON.stringify(ballot.value.data));
        const proof = Buffer.from(ballot.proof.data);
        const value = Buffer.from(ballot.value.data);
        const ballotDigest = vmsg.ballotDigest;
        const sponsor = vmsg.admin;
        const PK2 = Buffer.from(Keys[sponsor.id].PK.data);
        const SK2 = Buffer.from(Keys[sponsor.id].SK.data);
        const random = JSON.stringify(this.view) + JSON.stringify(this.blockChain.getLatestBlock().index);
        const verifiedResult = ecvrf.verify(PK2, random, proof, value);
        const PK = keys[sponsor.id].PK;
        const verifySignResult = this.verifySignature(vbuf, sig, PK);
        if(!verifySignResult) { console.log("signature fail"); }
        const verifyIdentity = this.verifyIdentity(sponsor, this.MCL);
        const verifyDigestResult = this.verifyDigest(JSON.stringify(vmsg.ballot), ballotDigest);
        const verifyResult = verifyDigestResult && verifySignResult && verifyIdentity && verifiedResult;

        const vote = utils.byte2Int(data.splice(8, 4));
        
        this.vrfBallots.push({ "voter": sponsor.id, "vote": vote });
        return verifyResult;
    }

    handleVoteResult(vrmsg) { 
        const sig = vrmsg.signature;
        delete vrmsg.signature;
        const newLeader = vrmsg.newLeader;
        const vrbuf = Buffer.from(JSON.stringify(vrmsg));
        const num = this.vrf_n;
        if(this.vrmsgQuene[num] === undefined) this.vrmsgQuene[num] = 1;
        
        const ballots = vrmsg.ballots;
        const ballotsDigest = vrmsg.ballotsDigest;
        const sponsor = vrmsg.admin;

        const PK = keys[sponsor.id].PK;
        const verifySignResult = this.verifySignature(vrbuf, sig, PK);
        if(!verifySignResult) { console.log("signature fail"); }
        const verifyIdentity = this.verifyIdentity(sponsor, this.MCL);
        const verifyDigestResult = this.verifyDigest(JSON.stringify(ballots), ballotsDigest);

        //判断是否以选出新leader
        const verifyNewLeader = (utils.calculateHash(JSON.stringify(newLeader)) === utils.calculateHash(JSON.stringify(this.tempLeader)));
        const verifyResult = verifyDigestResult && verifySignResult && verifyIdentity;
        return verifyResult;
    }

    handleVoteAck(vamsg) {
        const sig = vamsg.signature;
        delete vamsg.signature;
        const vabuf = Buffer.from(JSON.stringify(vamsg));
        const num = this.vrf_n;
        if(this.vamsgQuene[num] === undefined) this.vamsgQuene[num] = 1;
        const sponsor = vamsg.admin;

        const PK = keys[sponsor.id].PK;
        const verifySignResult = this.verifySignature(vabuf, sig, PK);
        if(!verifySignResult) { console.log("signature fail"); }
        const verifyIdentity = this.verifyIdentity(sponsor, this.MCL);
        const verifyResult = verifySignResult && verifyIdentity;
        return verifyResult;
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
        return stringMCL.indexOf(utils.calculateHash(JSON.stringify(signer))) !== -1;
    }

    verifySponsor(txn) {
        const domainType = txn.type;
        if(domainType === 1) {
            return true;
        } else if(domainType === 2 || domainType === 3) {
            const sponsor = txn.sponsor;
            const domainName = txn.domainName;
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
        if(!worldState[domainName]) {
            txnResult = this.handleDomainOutput(domainName, domainOutput);
            this.tempWorldState[domainName] = txnResult;
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
        const type = 1;
        const domainType = msg.domainType || 0;
        const sponsor = msg.sponsor || {};
        const domainName = msg.domainName || "";
        const domainInput = msg.domainInput || [];
        const domainInputFromTxnHash = msg.domainInputFromTxnHash || "";
        const domainInputFromTxnIndex = msg.domainInputFromTxnIndex || -1;
        const domainOutput = msg.domainOutput || [];
        const timestamp = (new Date()).getTime();
        const txn = new Transaction(version, this.txnID, business, domainType, sponsor, domainName, domainInput, domainInputFromTxnHash, domainInputFromTxnIndex, domainOutput, timestamp);
        this.txnID++;
        return JSON.stringify(txn);
    }

    //-----------------------------------------构建PBFT消息-----------------------------------------
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

    //-----------------------------------------构建ViewChange消息-----------------------------------------

    buildChangeViewRequest() {
        const business = 2; 
        const type = 6;
        const timestamp = (new Date()).getTime();
        const view = this.view + 1;
        const replica = this.admin;

        const mh = new MsgHead(this.msgID, business, type, replica, timestamp);
        const mb = new MsgChangeView(view);
        const cvqmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(cvqmsg);
    }

    buildChangeViewResponse() {
        const business = 2; 
        const type = 7;
        const timestamp = (new Date()).getTime();
        const view = this.view + 1;
        const replica = this.admin;

        const mh = new MsgHead(this.msgID, business, type, replica, timestamp);
        const mb = new MsgChangeView(view);
        const cvrmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(cvrmsg);
    }

    buildChangeViewAck() {
        const business = 2; 
        const type = 8;
        const timestamp = (new Date()).getTime();
        const view = this.view + 1;
        const replica = this.admin;

        const mh = new MsgHead(this.msgID, business, type, replica, timestamp);
        const mb = new MsgChangeView(view);
        const cvamsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(cvamsg );
    }

    buildNewView() {
        const business = 2; 
        const type = 9;
        const timestamp = (new Date()).getTime();
        const view = this.view + 1;
        const replica = this.admin;

        const mh = new MsgHead(this.msgID, business, type, replica, timestamp);
        const mb = new MsgChangeView(view);
        const nvmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(nvmsg );
    }

    buildNewView() {
        const business = 2; 
        const type = 9;
        const timestamp = (new Date()).getTime();
        const view = this.view + 1;
        const replica = this.admin;

        const mh = new MsgHead(this.msgID, business, type, replica, timestamp);
        const mb = new MsgChangeView(view);
        const nvmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(nvmsg );
    }

    buildNewView() {
        const business = 2; 
        const type = 9;
        const timestamp = (new Date()).getTime();
        const view = this.view + 1;
        const leader = this.admin;

        const mh = new MsgHead(this.msgID, business, type, leader, timestamp);
        const mb = new MsgChangeView(view);
        const nvmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(nvmsg );
    }

    buildNewViewAck() {
        const business = 2; 
        const type = 10;
        const timestamp = (new Date()).getTime();
        const view = this.view + 1;
        const replica = this.admin;

        const mh = new MsgHead(this.msgID, business, type, replica, timestamp);
        const mb = new MsgChangeView(view);
        const nvamsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(nvamsg );
    }

    //-----------------------------------------构建VRF消息-----------------------------------------
    buildVote() {
        const PK = Buffer.from(Keys[this.admin.id].PK.data);
        const SK = Buffer.from(Keys[this.admin.id].SK.data);
        const business = 3;
        const type = 1;
        const timestamp = (new Date()).getTime();
        const view = this.view + 1;
        const replica = this.admin;
        const random = JSON.stringify(this.view) + JSON.stringify(this.blockChain.getLatestBlock().index);
        const { value, proof } = ecvrf.vrf(PK, SK, random);
        const ballot = { "value": value, "proof": proof };
        const ballotDigest = utils.calculateHash(JSON.stringify(ballot));
        const mh = new MsgHead(this.msgID, business, type, replica, timestamp);
        const mb = new MsgVote(view, ballot, ballotDigest);
        const vmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(vmsg);
    }

    buildVoteResult() {
        const business = 3;
        const type = 2;
        const timestamp = (new Date()).getTime();
        const view = this.view + 1;
        const replica = this.admin;
        const ballots = this.vrfBallots;

        //暂时这么写
        const biggestVote = ballots.sort((a, b) => {
            return b.vote - a.vote;
        })[0];
        const ballotsDigest = utils.calculateHash(JSON.stringify(ballots));
        const newLeader = this.MCL[this.searchMCL({id: biggestVote.voter}, this.MCL)];
        this.tempLeader = newLeader;
        const mh = new MsgHead(this.msgID, business, type, replica, timestamp);
        const mb = new MsgVoteResult(view, ballots, ballotsDigest, newLeader);
        const vrmsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(vrmsg);
    }

    buildVoteAck() {
        const business = 3;
        const type = 3;
        const timestamp = (new Date()).getTime();
        const view = this.view + 1;
        const responsor = this.admin;

        const mh = new MsgHead(this.msgID, business, type, responsor, timestamp);
        const mb = new MsgVoteAck(view);
        const vamsg = new Message(mh, mb);
        this.msgID++;
        return JSON.stringify(vamsg);
    }

    //-----------------------------------------构建新区块消息-----------------------------------------
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
        const id = sponsor.id;
        let index = 0;
        for (const i of MCL) {
            if(id === i.id) {
                index = MCL.indexOf(i);
            }
        }
        return  index;
    }

    //-----------------------------------------构建DNS响应报文-----------------------------------------
    buildDNSResponse(query, response) {
        
    }
}

module.exports = Peer;
