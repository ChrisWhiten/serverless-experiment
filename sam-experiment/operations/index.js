'use strict';
const dynamodb = require('../operationaldynamodb');
const uuid = require('uuid');

const createLocationsParams = {
  TableName: 'locations',
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
};

const createSchedulesParams = {
  TableName: 'schedules',
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
    // { AttributeName: 'start', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    // { AttributeName: 'name', AttributeType: 'S' },
    // { AttributeName: 'start', AttributeType: 'S' },
    // { AttributeName: 'end', AttributeType: 'S' },
    // { AttributeName: 'schedule', AttributeType: '???'}
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
};

const createBookingsParam = {
  TableName: 'bookings',
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
    // { AttributeName: 'start', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S'},
    // { AttributeName: 'name', AttributeType: 'S' },
    // { AttributeName: 'start', AttributeType: 'S' },
    // { AttributeName: 'end', AttributeType: 'S' },
    // { AttributeName: 'schedule', AttributeType: '???'}
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
};

const createSlotsParam = {
  TableName: 'slots',
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
    // { AttributeName: 'start', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S'},
    // { AttributeName: 'name', AttributeType: 'S' },
    // { AttributeName: 'start', AttributeType: 'S' },
    // { AttributeName: 'end', AttributeType: 'S' },
    // { AttributeName: 'schedule', AttributeType: '???'}
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
};

const createUsersParams = {
  TableName : "users",
  KeySchema: [       
      { AttributeName: "id", KeyType: "HASH"},  //Partition key
      { AttributeName: "name", KeyType: "RANGE" }  //Sort key
  ],
  AttributeDefinitions: [       
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "name", AttributeType: "S" }
  ],
  ProvisionedThroughput: {       
      ReadCapacityUnits: 1, 
      WriteCapacityUnits: 1
  }
};

exports.handler = (event, context, callback) => {

  const createLocations = dynamodb.createTable(createLocationsParams).promise();
  const createUsers = dynamodb.createTable(createUsersParams).promise();
  const createSchedules = dynamodb.createTable(createSchedulesParams).promise();
  const createSlots = dynamodb.createTable(createSlotsParam).promise();
  const createBookings = dynamodb.createTable(createBookingsParam).promise();

  Promise.all([createLocations, createUsers, createSchedules, createSlots, createBookings]).then(values => {
    console.log('Created!', values);
    const response = {
      statusCode: 200,
      body: 'tables created',
    };

    callback(null, response);
  }).catch(err => {
    console.log('Why was there an error?', err);
    const response = {
      statusCode: 401,
      body: err,
    };
  });
}