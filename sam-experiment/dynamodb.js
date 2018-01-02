'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let options = {};
const IS_OFFLINE = true;// process.env.IS_OFFLINE;
// https://github.com/awslabs/aws-sam-local/issues/102
// to setup: sudo ifconfig lo0 alias 172.16.123.1
// to remove: sudo ifconfig lo0 -alias 172.16.123.1
const endpoint = '';
// connect to local DB if running offline
if (IS_OFFLINE) {
  options = {
    region: 'localhost',
    endpoint: 'http://172.16.123.1:8000',
    apiVersion: '2012-08-10',
  };
}

AWS.config.update({
  endpoint: 'http://172.16.123.1:8000',
  apiVersion: '2012-08-10',
});

const client = new AWS.DynamoDB.DocumentClient();

module.exports = client;

// const config = {
//   "apiVersion": "2012-08-10",
//   "accessKeyId": "abcde",
//   "secretAccessKey": "abcde",
//   "region":"us-west-2",
//   "endpoint": "http://172.16.123.1:8000"
// }
// const client = new AWS.DynamoDB(config);
// module.exports = client;