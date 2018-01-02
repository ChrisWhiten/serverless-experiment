'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const json = JSON.parse(event.body);
  console.log('Schedule json:', json);
  
  const params = {
    TableName: 'schedules',
    Key: {
      id: json.id,
    },
    UpdateExpression: 'set #name = :n, updatedAt = :u, #start = :s, #end = :e, schedule = :sch, locations = :loc',
    ExpressionAttributeValues: {
      ':n': json.name,
      ':u': timestamp,
      ':s': json.start,
      ':e': json.end,
      ':sch': json.schedule,
      ':loc': json.locations,
    },
    ExpressionAttributeNames: {
      '#name': 'name',
      '#start': 'start',
      '#end': 'end',
    },
  };

  dynamodb.update(params, (error, res) => {
    console.log('put complete', res);
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