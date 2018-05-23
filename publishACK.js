let redis = require('redis');
const rds_port = 6379;
// const rds_host ="97.64.83.123";
const rds_host ="127.0.0.1";
const rds_opts = {
    // auth_pass:'loraweb115'
};
let publisher = redis.createClient(rds_port, rds_host, rds_opts);
let ACK = {
    ACKType:"OK",
    ACKContent:"水量：100t" //可选
};

publisher.publish('ACKChannel', JSON.stringify(ACK));