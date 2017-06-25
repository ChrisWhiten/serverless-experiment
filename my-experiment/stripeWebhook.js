'use strict';

const config = require('./config/config');

module.exports.stripeWebhook = (event, context, callback) => {
  console.log('made it.');
  console.log('request:', event);

  const stripe = require('stripe')(config.stripeSecretKey);

  try {
    const json = JSON.parse(event.body);
    console.log('Stripe event json:', json);

    console.log('about to retrieve event with id', json.id);
    stripe.events.retrieve(json.id, (err, stripeEvent) => {
      console.log('retrieved stripe event:', stripeEvent);
      const eventType = stripeEvent.type ? stripeEvent.type : '';
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Stripe webhook incoming!',
          stage: event.requestContext.stage,
        }),
      };

      console.log('event type:', eventType);

      // branch by event type
      switch (eventType) {
        case 'invoice.created':
          console.log('invoice is created!');
          break;
        default:
          console.log('i am not handling this event');
          break;
      }

      return callback(null, response);
    });
  } catch (err) {
    return context.fail(err);
  }
};
