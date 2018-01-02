'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();

  console.log('ok...', event)
  const json = JSON.parse(event.body);
  console.log('Schedule json:', json);
  
  const params = {
    TableName: 'schedules',
    Item: {
      id: uuid.v1(),
      createdAt: timestamp,
      updatedAt: timestamp,
      name: json.name,
      start: json.start,
      end: json.end,
      schedule: json.schedule,
      locations: json.locations || [],
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