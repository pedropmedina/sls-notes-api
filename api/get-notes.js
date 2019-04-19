/* eslint-disable no-console */

/**
 * Route: GET /notes
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });

const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tablename = process.env.NOTES_TABLE;

exports.handler = async event => {
  try {
    let query = event.queryStringParameters;
    let limit = query && query.limit ? parseInt(query.limit) : 5;
    let user_id = util.getUserId(event.headers);

    let params = {
      TableName: tablename,
      KeyConditionExpression: 'user_id = :uid',
      ExpressionAttributeValues: {
        ':uid': user_id
      },
      Limit: limit,
      ScanIndexForward: false
    };

    let startTimestamp = query && query.start ? parseInt(query.start) : 0;

    if (startTimestamp > 0) {
      params.ExclusiveStartKey = {
        user_id: user_id,
        timestamp: startTimestamp
      };
    }

    let data = await dynamodb.query(params).promise();

    return {
      statusCode: 200,
      headers: util.getResponseHeaders(),
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.log('Error', error);
    return {
      statusCode: error.statusCode ? error.statusCode : 500,
      headers: util.getResponseHeaders(),
      body: JSON.stringify({
        error: error.name ? error.name : 'Exception',
        message: error.message ? error.message : 'Unknown error'
      })
    };
  }
};
