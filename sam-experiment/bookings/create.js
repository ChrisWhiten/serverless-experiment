'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');

exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const json = JSON.parse(event.body);
  console.log('Booking json:', json);
  
  const params = {
    TableName: 'bookings',
    Item: {
      id: uuid.v1(),
      createdAt: timestamp,
      updatedAt: timestamp,
      leaderFirstName: json.leaderFirstName,
      leaderLastName: json.leaderLastName,
      leaderEmail: json.leaderEmail,
      leaderPhoneNumber: json.leaderPhoneNumber,
      slotCount: json.slotCount,
      start: json.start,
      duration: json.duration,
      locationName: json.locationName,
      locationId: json.locationId,
      paidAmount: json.paidAmount,
      bookingCost: json.bookingCost,
    },
  };


  dynamodb.put(params, (error, res) => {
    console.log('create complete', res);
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t create the booking.'));
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