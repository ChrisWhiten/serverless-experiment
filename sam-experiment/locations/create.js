'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const json = JSON.parse(event.body);
  console.log('Location json:', json);
  
  const params = {
    TableName: 'locations',
    Item: {
      id: uuid.v1(),
      createdAt: timestamp,
      updatedAt: timestamp,
      locationName: json.locationName,
      locationAddress: json.locationAddress,
    },
  };


  dynamodb.put(params, (error, res) => {
    console.log('create complete', res);
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t create the schedule.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
}