'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const json = JSON.parse(event.body);
  console.log('Slot json:', json);

  const params = {
    TableName: 'slots',
    Item: {
      id: uuid.v1(),
      createdAt: timestamp,
      updatedAt: timestamp,
      duration: json.duration,
      startTime: json.startTime,
      tenantId: 'foo', // TODO: read from token
      locationId: json.locationId,
      totalSlots: json.totalSlots,
    },
  };


  dynamodb.put(params, (error, res) => {
    console.log('create complete', res);
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t create the slot.'));
      return;
    }

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,PATCH,DELETE'
      },
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
}