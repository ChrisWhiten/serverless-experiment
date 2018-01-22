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
const moment = require('moment-timezone');

const slotQuery = {
  TableName: 'slots',
};
const scheduleQuery = {
  TableName: 'schedules',
};
const bookingQuery = {
  TableName: 'bookings',
};

function initializeLocations(schedules) {
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
  let currentDate = moment(start).tz('America/Toronto');
  console.log('hmmm', start, end);
  while (currentDate < end) {
    console.log('processing date', moment(currentDate).tz('America/Toronto').format('dddd, MMMM Do YYYY, h:mm:ss a'));
    console.log('------------------------');
    const dow = moment(currentDate).format('dddd'); // "Monday", "Tuesday", etc..
    schedules.forEach(s => {
      if (dow in s.schedule) {
        console.log(dow,'is in', s);
        if (s.locations) {
          s.locations.forEach(l => {
            s.schedule[dow].forEach(slot => {
              const newSlot = Object.assign({}, slot);
              const scheduledSlotTime = moment(slot.startTime).tz('America/Toronto');
              let computedSlot = moment(currentDate).tz('America/Toronto');
              computedSlot.set({
                hour: scheduledSlotTime.hour(),
                minute: scheduledSlotTime.minute(),
                second: 0,
                second: 0,
                millisecond: 0,
              });
              newSlot.startTime = new Date(computedSlot);
              console.log('adding', newSlot, l);
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
    const l = locationMap[b.locationId];
    const slotList = slots[l].bookings;
    const timeToMatch = new Date(b.start);
    timeToMatch.setSeconds(0);
    timeToMatch.setMilliseconds(0);
    for (let i = 0; i < slotList.length; i++) {
      let slot = slotList[i];

      if (moment(slot.startTime).isSame(timeToMatch)) {
        console.log('THE SAME!', slot.startTime, timeToMatch);
        if (!slot.bookings) {
          slot.bookings = [];
        }

        slot.bookings.push(b);
        break;
      } else {
        console.log('not.', slot.startTime, timeToMatch);
      }
    }
  });
}

function populateWithIndividualSlots(slots, locationMap, individualSlots) {
  console.log('before...', JSON.stringify(slots));
  individualSlots.forEach(s => {
    slots[locationMap[s.locationId]].bookings.push(s);
  });

  console.log('after...', JSON.stringify(slots));
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

  console.log('valid query params');

  const start = new Date(parseInt(event.queryStringParameters.start));
  const end = new Date(parseInt(event.queryStringParameters.end));
  const tenantId = 'foo'; // TODO: read from token
  const locationIds = ['7feca3c0-ed9e-11e7-a85f-afc7af12ef79', '8f705990-ed9e-11e7-a8ca-dd0857dd3dcf']; // TODO: read from token

  // event.queryStringParameters.start (utc timestamp)
  // event.queryStringParameters.end (utc timestamp)

  bookingQuery.IndexName = 'ByTenantAndStartTimeIndex';
  bookingQuery.KeyConditionExpression = 'tenantId = :t and #start between :s and :e';
  bookingQuery.ExpressionAttributeValues = {
    ':s': start.getTime(),
    ':e': end.getTime(),
    ':t': tenantId,
  };
  bookingQuery.ExpressionAttributeNames = {
    '#start': 'start',
  };

  if (locationIds) {
    const locationsObj = {};
    let index = 0;
    locationIds.forEach(l => {
      locationsObj[`:locationvalue${index}`] = l;
      index++;
    });

    const quoted = locationIds.map(l => `"${l}"`);
    bookingQuery.FilterExpression = `locationId IN (${Object.keys(locationsObj).toString()})`;
    Object.keys(locationsObj).forEach(l => {
      bookingQuery.ExpressionAttributeValues[l] = locationsObj[l];
    });
  }

  slotQuery.IndexName = 'SlotsByTenantAndStartTimeIndex';
  slotQuery.KeyConditionExpression = 'tenantId = :t and startTime between :s and :e';
  slotQuery.ExpressionAttributeValues = {
    ':s': start.getTime(),
    ':e': end.getTime(),
    ':t': tenantId,
  };

  // this is a duplicate of the booking query.  should it be?
  if (locationIds) {
    const locationsObj = {};
    let index = 0;
    locationIds.forEach(l => {
      locationsObj[`:locationvalue${index}`] = l;
      index++;
    });

    const quoted = locationIds.map(l => `"${l}"`);
    slotQuery.FilterExpression = `locationId IN (${Object.keys(locationsObj).toString()})`;
    Object.keys(locationsObj).forEach(l => {
      slotQuery.ExpressionAttributeValues[l] = locationsObj[l];
    });
  }

  const getSlots = dynamodb.query(slotQuery).promise();
  // const getSlots = dynamodb.scan(slotQuery).promise();
  const getSchedules = dynamodb.scan(scheduleQuery).promise();
  const getBookings = dynamodb.query(bookingQuery).promise();

  Promise.all([getSlots, getSchedules, getBookings]).then((results) => {
    const individualSlots = results[0].Items;
    console.log('^^^^^');
    console.log(individualSlots);
    console.log(slotQuery);
    console.log('^^^^^');
    const schedules = results[1].Items;
    // return grouped by location
    // grouped by day
    // a list of availability slots
    // embed bookings into availability slots

    // cycle through dates between start/end time
    // figure out what DOW it is, pull slots from matching schedules for each DOW
    // more, but let's start with that...

    // console.log('&&&&&&&');
    // console.log(JSON.stringify(results[2].Items));
    // console.log('&&&&&&&');
    // initialize location map
    // console.log('got some schedules', schedules)
    const slotsAndMap = initializeLocations(schedules, start, end); // once we have bookings + slots too, include that in initialization
    console.log('locations initialized');
    let slots = slotsAndMap[0];
    let locationMap = slotsAndMap[1];
    populateEphemeralSlots(slots, locationMap, schedules, start, end);
    populateWithIndividualSlots(slots, locationMap, individualSlots);
    // console.log('ephemeral slots created', JSON.stringify(slots));
    const bookings = results[2].Items;
    populateBookings(slots, bookings, locationMap);
    console.log('bookings populated', bookings);

    console.log('returning', JSON.stringify(slots));
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
    console.log('uh oh...');
    console.log('Why was there an error?', err);
    const response = {
      statusCode: 401,
      body: err,
    };
  });
}