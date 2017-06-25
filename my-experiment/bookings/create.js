'use strict';

const uuid = require('uuid');
const dynamodb = require('../dynamodb');

module.exports.create = (event, context, callback) => {
  console.log('i am creating a booking!');
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  if (typeof data.text !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t create the booking.'));
    return;
  }

  const params = {
    TableName: process.env.BOOKING_TABLE,
    Item: {
      id: uuid.v1(),
      text: data.text,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };


  // write the todo to the database
  dynamodb.put(params, (error) => {
    console.log('put complete');
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t create the booking.'));
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};
