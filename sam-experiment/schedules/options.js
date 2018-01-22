'use strict';
const dynamodb = require('../dynamodb');

exports.handler = (event, context, callback) => {

  console.log('event', event);
  console.log('context', context);
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3001',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,PATCH,DELETE'
    },
  };
  callback(null, response);
}