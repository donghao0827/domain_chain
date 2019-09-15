# domain_chain
# 本系统基于Node.js编写而成
本系统可实现域名的注册、更新、注销和域名的查询， 可运行PBFT算法（包括视图变更）、VRF算法
### 系统启动方式
1. 安装系统依赖
``` 
npm install
```
2. 打开五个终端，分别运行：
```
node peer-china.js
node peer-france.js
node peer-russia.js
node peer-usa.js
node peer-uk.js
```

### 目录结构
1. mock 假数据文件，本地测试时使用的数据;
2. node_modules 系统依赖;
3. public 系统运行使用的一些公共文件;
4. src 系统源码
源码中主要包括：
* Admin.js 用户类
* Block.js 区块类
* BlockChain.js 区块链类
* Message.js 消息类
* Peer.js 节点类
* Transaction.js 交易类
* Key 各节点生成的本地密钥

### API 
1. 查询域名  
    接口 /query  
    请求类型 GET  
    参数 query_name  
    实例 /query?query_name=cn  
2. 查询临时世界状态（未生成新区快时）  
    接口 /showtempws  
    请求类型 GET  
3. 查询世界状态   
    接口 /showws  
    请求类型 GET  
4. 查询区块链  
    接口 /showblockchain  
    请求类型 GET  
5. 交易  
    接口 /txn  
    请求类型 POST  
    实例   
    ``` json
    { 	
        "sponsor": { "id": "us-0001", "name": "USA", "domain": ["us"] },
        "type": 0,
        "domainType": 1,
        "domainName": "com",
        "domainInput": [],
        "domainInputTxnHash": "d5087e070779e94ffb32093d",
        "domainInputTxnIndex": 0,
        "domainOutput":[	
        {
            "Name": "com",
            "Type": 2,
            "Class": 1,
            "TTL":172800,
            "Value":"a.gtld-servers.net"
        },
        {
            "Name":"a.gtld-servers.net",
            "Type":1,
            "Class":1,
            "TTL":172800, 
            "Value": "192.5.6.30"
        }
        ]
    }
    ```


