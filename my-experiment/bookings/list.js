'use strict';

const dynamodb = require('../dynamodb');

module.exports.list = (event, context, callback) => {
  const params = {
    TableName: process.env.BOOKING_TABLE,
  };

  console.log('event:', event);

  if (!event || !event.queryStringParameters) {
    console.log('Query string parameters are required.  Bad request');
    const response = {
      statusCode: 400,
    };
    return callback(response, null);
  }

  switch (event.queryStringParameters.type) {
    case 'upcoming':
    case 'participating':
    case 'calendar':
    default:
      dynamodb.scan(params, (error, result) => {
        if (error) {
          console.error(error);
          callback(new Error('Couldn\'t fetch the bookings.'));
          return;
        }

        const response = {
          statusCode: 200,
          body: JSON.stringify(result.Items),
        };
        callback(null, response);
      });
  }
};