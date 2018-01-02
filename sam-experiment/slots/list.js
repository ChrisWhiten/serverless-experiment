// when listing slots, pull from 3 DBs
// 1: Pull from slots table, which override all else
// These can be used to close a slot, add more availability,
// add non-traditional hours, etc.
// 2: Pull from /schedules.  This creates "ephemeral" slots
// 3: Pull from bookings and hydrate the slots with booking info
//
// Require date range when pulling slots
// Max range: 31 days

'use strict';
const dynamodb = require('../dynamodb');
const uuid = require('uuid');
const moment = require('moment');

const slotQuery = {
  TableName: 'slots',
};
const scheduleQuery = {
  TableName: 'schedules',
};
const bookingQuery = {
  TableName: 'bookings',
};

function initializeLocations(schedules, start, end) {
  const locationMap = {};
  let slots = [];
  schedules.map(s => {
    if (s.locations) {
      s.locations.forEach(l => {
        if (!(l.locationId in locationMap)) {
          locationMap[l.locationId] = slots.length;
          slots.push({
            locationName: l.locationName,
            locationID: l.locationId,
            bookings: [],
          });
        }
      });
    }
  });

  // return slots;
  return [slots, locationMap];
}

function populateEphemeralSlots(slots, locationMap, schedules, start, end) {
  let currentDate = start;
  while (currentDate < end) {
    const dow = moment(currentDate).format('dddd');
    schedules.forEach(s => {
      if (dow in s.schedule) {
        if (s.locations) {
          s.locations.forEach(l => {
            s.schedule[dow].forEach(slot => {
              const newSlot = Object.assign({}, slot);
              const scheduledSlotTime = new Date(slot.startTime);
              let computedSlot = moment(currentDate);
              computedSlot.set({
                hour: scheduledSlotTime.getHours(),
                minute: scheduledSlotTime.getMinutes(),
              });
              newSlot.startTime = new Date(computedSlot);
              slots[locationMap[l.locationId]].bookings.push(newSlot);
            });
          });
        }
      }
    });

    currentDate = new Date(moment(currentDate).add(1, 'days')).getTime();
  }
}

function populateBookings(slots, bookings, locationMap) {
  bookings.forEach(b => {
    const slotList = slots[locationMap[b.locationId]].bookings;
    const timeToMatch = new Date(b.start);
    timeToMatch.setSeconds(0);
    timeToMatch.setMilliseconds(0);
    for (let i = 0; i < slotList.length; i++) {
      let slot = slotList[i];

      if (moment(slot.startTime).isSame(timeToMatch)) {
        if (!slot.bookings) {
          slot.bookings = [];
        }

        slot.bookings.push(b);
        break;
      }
    }
  });
}

exports.handler = (event, context, callback) => {
  // TODO: parse params
  // add date range to all above queries ^
  console.log('event', event);
  if (!event || 
    !event.queryStringParameters || 
    !event.queryStringParameters.start || 
    !event.queryStringParameters.end) {
    console.log('Query string parameters (start, end) are required.  Bad request');
    const response = {
      statusCode: 400,
    };
    return callback(response, null);
  }

  const start = new Date(event.queryStringParameters.start);
  const end = new Date(event.queryStringParameters.end);

  // event.queryStringParameters.start (utc timestamp)
  // event.queryStringParameters.end (utc timestamp)

  const getSlots = dynamodb.scan(slotQuery).promise();
  const getSchedules = dynamodb.scan(scheduleQuery).promise();
  const getBookings = dynamodb.scan(bookingQuery).promise();

  Promise.all([getSlots, getSchedules, getBookings]).then((results) => {
    // return grouped by location
    // grouped by day
    // a list of availability slots
    // embed bookings into availability slots

    // cycle through dates between start/end time
    // figure out what DOW it is, pull slots from matching schedules for each DOW
    // more, but let's start with that...

    // initialize location map
    const schedules = results[1].Items;
    const slotsAndMap = initializeLocations(schedules, start, end); // once we have bookings + slots too, include that in initialization
    let slots = slotsAndMap[0];
    let locationMap = slotsAndMap[1];
    populateEphemeralSlots(slots, locationMap, schedules, start, end);
    const bookings = results[2].Items;
    populateBookings(slots, bookings, locationMap);

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,PATCH,DELETE'
      },
      body: JSON.stringify(slots),
      // body: {
      //   // slots: results[0].Items,
      //   // schedules: results[1].Items,
      //   // bookings: results[2].Items,
      // },
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