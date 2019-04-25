// const {utils, ecvrf, sortition} = require('vrf.js');
// //const X = Buffer.from('test')

// const [publicKey, privateKey] = utils.generatePair();
// console.log(">>>>>>>", publicKey, ">>>>>>>", privateKey);


// const { ecvrf } = require('vrf.js')
// const Keys = require('./src/Key/Keys');
// const fs = require('fs');
// fs.writeFile('./src/Key/Key.json', JSON.stringify(Keys), { 'flag': 'w' }, (err) => {
//     if(err) {
//         throw err;
//     }
// });
// const Keys = require('./src/Key/Key.json');

// console.log("uijahdslhalsd", Keys);

// const utils = require('./public/Utils');

// console.log(utils.byte2Int([255,255,255,255,255,255,255,255]));


const dgram = require('dgram');
const WorldState = require('./mock/worldState');
var udp_server = dgram.createSocket('udp4');
udp_server.bind(53); // 绑定端口

// 监听端口
udp_server.on('listening', function () {
    console.log('udp server linstening 53.');
})

//接收消息
udp_server.on('message', function (msg, rinfo) {
    strmsg = msg.toString();
    udp_server.send();
    console.log(">>>>>>>>>>>>", WorldState.cn);
})
//错误处理
udp_server.on('error', function (err) {
    console.log('some error on udp server.')
    udp_server.close();
})