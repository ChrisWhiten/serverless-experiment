'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();
  
  const params = {
    TableName: 'users',
  };
  


  dynamodb.scan(params, (error, result) => {
    console.log('scan complete');
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t list the users.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });
}