'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const params = {
    TableName: 'blocks',
    Key: {
      id: event.pathParameters.id,
    },
  };

  dynamodb.delete(params, (error, result) => {
    console.log('delete complete', result);
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t delete the block.'));
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