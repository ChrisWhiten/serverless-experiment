'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const params = {
    TableName: 'bookings',
    Key: {
      id: event.pathParameters.id,
    },
  };

  console.log('calling get...', params);
  dynamodb.get(params, (error, result) => {
    console.log('get complete', result);
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t get the booking.'));
      return;
    }

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,PATCH,DELETE'
      },
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
}