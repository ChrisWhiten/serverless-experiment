'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const config = require('./config');

const dynamoConfig = {
  apiVersion: '2012-08-10',
  region: 'us-west-2',
};

if (config.IS_OFFLINE) {
  dynamoConfig.endpoint = 'http://172.16.123.1:8000';
} else {
  dynamoConfig.accessKeyId = config.ACCESS_KEY_ID;
  dynamoConfig.secretAccessKey = config.SECRET_ACCESS_KEY;
}

const client = new AWS.DynamoDB(config);
module.exports = client;