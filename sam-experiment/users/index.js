'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();
  
  const params = {
    TableName: 'users',
    Item: {
      id: uuid.v1(),
      name: 'Christopher',
      metadata: {
        customerId: 123,
        customerName: 'Hello world'
      },
      verified: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };
  


  dynamodb.put(params, (error) => {
    console.log('put complete');
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t create the user.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
}