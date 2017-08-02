'use strict';

const dynamodb = require('../dynamodb');

module.exports.delete = (event, context, callback) => {
  const params = {
    TableName: process.env.BOOKING_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  dynamodb.delete(params, (error) => {
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t remove the booking item.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify({}),
    };
    callback(null, response);
  });
};
