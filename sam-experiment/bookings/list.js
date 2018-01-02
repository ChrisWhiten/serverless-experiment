'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const params = {
    TableName: 'bookings',
  };

  dynamodb.scan(params, (error, result) => {
    console.log('scan complete');
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t list the bookings.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,PATCH,DELETE'
      },
    };
    callback(null, response);
  });
}