'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

// format: POST {id: bookingId, note: 'this is a note'}
exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const json = JSON.parse(event.body);
  const id = event.pathParameters.id;
  console.log('Booking/note json:', json);

  const expressionAttributeValues = {
    ':u': timestamp,
  };

  // TODO: pull from token
  const author = 'Chris Whiten';
  const updateExpressionItems = ['updatedAt = :u'];
  const newLogs = [];

  if (json.hasOwnProperty('note')) {
    const noteId = uuid.v1();
    updateExpressionItems.push('notes = list_append(notes, :n)');
    expressionAttributeValues[':n'] = [{
      note: json.note,
      createdAt: timestamp,
      visible: true,
      noteId,
      author,
    }];

    newLogs.push({
      creator: author,
      action: `Added a note`,
      timestamp,
    });
  }

  if (newLogs.length > 0) {
    updateExpressionItems.push('logs = list_append(logs, :l)');
    expressionAttributeValues[':l'] = newLogs;
  }

  const params = {
    TableName: 'bookings',
    Key: {
      id,
    },
    UpdateExpression: `set ${updateExpressionItems.join()}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };

  console.log('here are my update params', JSON.stringify(params));
  dynamodb.update(params, (error, res) => {
    console.log('note added', res);
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t update the booking.'));
      return;
    }

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,PATCH,DELETE'
      },
      body: JSON.stringify(res),
    };
    callback(null, response);
  });
}