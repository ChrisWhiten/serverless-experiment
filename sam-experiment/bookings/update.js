'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const json = JSON.parse(event.body);
  console.log('Booking json:', json);

  const expressionAttributeValues = {
    ':u': timestamp,
  };

  const requester = 'Chris Whiten';
  const updateExpressionItems = ['updatedAt = :u'];
  const newLogs = [];

  if (json.hasOwnProperty('checkedIn')) {
    updateExpressionItems.push('checkedIn = :c');
    expressionAttributeValues[':c'] = json.checkedIn;
    newLogs.push({
      creator: requester,
      action: `Updated on-site check-in count to ${json.checkedIn}`,
      timestamp,
    });
  }

  if (json.hasOwnProperty('payments')) {
    updateExpressionItems.push('payments = list_append(payments, :p)');
    expressionAttributeValues[':p'] = json.payments;
    newLogs.push({
      creator: requester,
      action: `Added payments of ${json.payments.map(p => { return '$' + (p/100).toFixed(2)})}`,
      timestamp,
    });
  }

  if (json.hasOwnProperty('slotCount')) {
    updateExpressionItems.push('slotCount = :slotCount');
    expressionAttributeValues[':slotCount'] = json.slotCount;
    newLogs.push({
      creator: requester,
      action: `Updated the slot count to ${json.slotCount}`,
      timestamp,
    });
  }

  if (json.hasOwnProperty('isCancelled')) {
    updateExpressionItems.push('isCancelled = :isCancelled');
    expressionAttributeValues[':isCancelled'] = json.isCancelled;

    let actionText = `Set cancelled status to ${json.isCancelled}`;
    if (json.hasOwnProperty('cancellationReason')) {
      updateExpressionItems.push('cancellationReason = :cancellationReason');
      expressionAttributeValues[':cancellationReason'] = json.cancellationReason;

      actionText = `Set cancelled status to ${json.isCancelled} because ${json.cancellationReason}`;
    }

    if (json.hasOwnProperty('otherCancellationReason')) {
      updateExpressionItems.push('otherCancellationReason = :otherCancellationReason');
      expressionAttributeValues[':otherCancellationReason'] = json.otherCancellationReason;

      actionText = `Set cancelled status to ${json.isCancelled} because ${json.otherCancellationReason}`;
    }

    newLogs.push({
      creator: requester,
      action: actionText,
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
      id: json.id,
    },
    UpdateExpression: `set ${updateExpressionItems.join()}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };

  dynamodb.update(params, (error, res) => {
    console.log('put complete', res);
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