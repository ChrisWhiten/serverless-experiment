"use strict";
const dynamodb = require("../dynamodb");
const uuid = require("uuid");

// format: POST {id: bookingId, payment: 2400}
exports.handler = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const json = JSON.parse(event.body);
  const id = event.pathParameters.id;
  console.log("Booking/payment json:", json);

  const expressionAttributeValues = {
    ":u": timestamp
  };

  // TODO: pull from token
  const author = "Chris Whiten";
  const updateExpressionItems = ["updatedAt = :u"];
  const newLogs = [];

  if (json.hasOwnProperty("payment")) {
    updateExpressionItems.push("payments = list_append(payments, :p)");
    expressionAttributeValues[":p"] = [json.payment];

    newLogs.push({
      creator: author,
      action: `Added a payment of ${json.payment}`,
      timestamp
    });
  }

  if (newLogs.length > 0) {
    updateExpressionItems.push("logs = list_append(logs, :l)");
    expressionAttributeValues[":l"] = newLogs;
  }

  const params = {
    TableName: "bookings",
    Key: {
      id
    },
    UpdateExpression: `set ${updateExpressionItems.join()}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  };

  console.log("here are my update params", JSON.stringify(params));
  dynamodb.update(params, (error, res) => {
    console.log("payment added", res);
    if (error) {
      console.error(error);
      callback(new Error("Couldn't update the booking."));
      return;
    }

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,PATCH,DELETE"
      },
      body: JSON.stringify(res)
    };
    callback(null, response);
  });
};
