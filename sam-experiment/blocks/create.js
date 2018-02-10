'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const json = JSON.parse(event.body);
  console.log('Block json:', json);

  const params = {
    TableName: 'blocks',
    Item: {
      id: uuid.v1(),
      tenantId: 'foo', // TODO: read from token
      createdAt: timestamp,
      updatedAt: timestamp,
      slotCount: json.slotCount,
      start: json.start,
      duration: json.duration,
      locationName: json.locationName,
      locationId: json.locationId,
      reason: json.reason,
    },
  };

  console.log('creating...', params);
  dynamodb.put(params, (error, res) => {
    console.log('block create complete', res);
    if (error) {
      console.log(Object.keys(error));
      console.log(error.message);
      console.log(error.code);
      console.log(error.statusCode);
      console.log(error.requestId);
      console.error(error);
      callback(new Error('Couldn\'t create the block.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,PATCH,DELETE'
      },
    };
    callback(null, response);
  });
}