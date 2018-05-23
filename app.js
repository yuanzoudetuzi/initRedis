/*
* 作用:在redis数据库为空时，初始化数据库中的数据，便于lora的web服务器代码测试
* */

let redis = require('redis'), rds_port = 6379, rds_host = "127.0.0.1",rds_opts = {};
let client = redis.createClient(rds_port, rds_host, rds_opts);
let userArray = [
    {
        UserName: "17380152222",
        UserType: "ADMIN",
        Password: "admin115"
    },
    {
        UserName: "15575925555",
        UserType: "NORMAL",
        Password: "admin115"
    }
];

let gatewayArray = ['001','002','003'];
let nodeLength = 4;
let nodeArray = ['1','2','3','4'];
let nodeSets=[];              /*存储每个网关下的节点*/
for(let i=0,len=gatewayArray.length;i<len;i++){
    let nodeLen = Math.floor(Math.random()*(nodeLength-1)+1);
    console.log('nodeLen = ' + nodeLen);
    let nodeSet = [];
    for(let j=1;j<=nodeLen;j++) {
        nodeSet.push(j);
    }
    nodeSets.push(nodeSet);
}

let autoZeros = function (str) {
    if (str < 10 && str >= 0) {
        return '0' + str.toString()
    }
    else if (str >= 10) {
        return str.toString()
    }
    else {
        return '**'
    }
};

//随机生成1或-1
let randomSymbol = function () {
    return Math.random()>0.5?1:-1;
};
console.log(nodeSets);
client.on('connect', function () {
    //添加用户集合,初始化用户信息
    for(let i=0,len=userArray.length;i<len;i++) {
        client.sadd("UserSet",userArray[i].UserName,redis.print);
        client.hmset("User:"+userArray[i].UserName,userArray[i],redis.print);
    }
    console.log("connect to redis");
    // 初始化用户网关数据
    for(let i=0,len=userArray.length;i<len;i++) {
        let l = userArray[i].UserType ==="ADMIN"?gatewayArray.length:Math.ceil(gatewayArray.length/2);
        for(let j=0;j<l;j++ ){
            client.sadd("User:"+userArray[i].UserName+":GatewayList",gatewayArray[j],redis.print);
            console.log("i = " + i  +",j = "+j);
        }
    }

   // 初始化每个网关的信息（目前就位置信息）和每个网关下的节点列表
    for(let i=0,len=gatewayArray.length;i<len;i++) {
        let gateway = {
            longitude: 103.9378300000+randomSymbol()*Math.random()/100,
            latitude: 30.7550430000+randomSymbol()*Math.random()/100                /*清水河校区经纬度*/
        };
        client.hmset("Gateway:"+gatewayArray[i],gateway,redis.print);
        let nodeSet = nodeSets[i];
        for(let j=0,l=nodeSet.length;j<l;j++){
            client.sadd("Gateway:"+gatewayArray[i]+":NodeList",nodeSet[j],redis.print);
        }
    }

   // 初始化节点的用户信息时间集合、系统信息时间集合、用户数据集合、系统数据集合
    let timeCount = 5;
    for(let i=0,len=nodeArray.length;i<len;i++) {
        for(let j=0;j<timeCount;j++){
            let time = '20170408' + autoZeros(parseInt(24 * Math.random())) + ':' + autoZeros(parseInt(60 * Math.random())) + ':' + autoZeros(parseInt(60 * Math.random()));
            let userInfo = {
                  water: parseInt(1000 * Math.random()),
                  power: parseInt(1000 * Math.random()),
                 longitude: parseInt(360 * Math.random()),
                 latitude: parseInt(360 * Math.random())
            };
            let sysInfo = {
                 feq: parseInt(1000 * Math.random()),
                 channel: parseInt(1000 * Math.random()),
                 modulation:'lora',
                 rssi:parseInt(20 * Math.random())+'dBm'
            };
            client.sadd("Node:"+nodeArray[i]+":UserInfo:TimeSet",time,redis.print);
            client.sadd("Node:"+nodeArray[i]+":SysInfo:TimeSet",time,redis.print);
            client.hmset("Node:"+nodeArray[i]+":UserInfoByTime:"+time,userInfo,redis.print);
            client.hmset("Node:"+nodeArray[i]+":SysInfoByTime:"+time,sysInfo,redis.print);
        }
    }
});

