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


// const dgram = require('dgram');
// const WorldState = require('./mock/worldState');
// const udp_server = dgram.createSocket('udp4');
// udp_server.bind(53); // 绑定端口

// // 监听端口
// udp_server.on('listening', function () {
//     console.log('udp server linstening 53.');
// })

// //接收消息
// udp_server.on('message', function (msg, rinfo) {
//     const messageID = msg.slice(0, 2).readInt16BE(0);
//     const flag = msg.slice(2, 12);
//     const dataleft = msg.slice(12);
//     let i = 0;
//     let domainArray = [];
//     while (dataleft[i] !== 0) {
//         const len = dataleft[i];
//         const domain = dataleft.slice(i + 1, len + i + 1);
//         domainArray.push(domain);
//         i = i + len + 1;
//     } 
//     const domainName = domainArray.map((item)=>{
//         return item.toString();
//     }).join('.');
//     const tldName = domainArray[domainArray.length - 1].toString();
//     console.log(domainName, WorldState[tldName]);
//     //udp_server.send();
//     //console.log(">>>>>>>>>>>>", msg.slice(2));
// })
// //错误处理
// udp_server.on('error', function (err) {
//     console.log('some error on udp server.')
//     udp_server.close();
// })

const query = {
    name: "www.qq.com",
    type: 1,
    class: 1
}

function domainName2byte(domainName) {
    const domainArray = domainName.split('.');
    const len = domainArray.length;
    let domainBuffer = Buffer.from("");
    for(let i = 0; i < len; i++) {
        // console.log(">>>", domainArray[i].length + domainArray[i]);
        lenBuffer = Buffer.alloc(1, domainArray[i].length);
        tempBuffer = Buffer.from(domainArray[i]);
        const totalLength = lenBuffer.length + tempBuffer.length + domainBuffer.length;
        domainBuffer = Buffer.concat([domainBuffer, lenBuffer, tempBuffer], totalLength);
    }
    domainBuffer = Buffer.concat([domainBuffer, Buffer.alloc(1, 0)], domainBuffer.length + 1);
    return Buffer.from(domainBuffer)
}

function IP2byte(IP) {
    const IPArray = IP.split('.').map((i)=>{
        return parseInt(i);
    });
    const sum = IPArray[0] * 256 * 256 * 256 + IPArray[1] * 256 * 256 + IPArray[2] * 256 + IPArray[3]; 
    return Buffer.alloc(sum);
}

console.log(IP2byte('192.168.27.239'));

function buildDNSResponse(query, response) {
    const queryName = Buffer.fromquery.Name
}