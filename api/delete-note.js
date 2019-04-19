/* eslint-disable no-console */

/**
 * Route: DELETE /note/t/{timestamp}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });

const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tablename = process.env.NOTES_TABLE;

exports.handler = async event => {
  try {
    let timestamp = parseInt(event.pathParameters.timestamp);
    let params = {
      TableName: tablename,
      Key: {
        user_id: util.getUserId(event.headers),
        timestamp: timestamp
      }
    };
    await dynamodb.delete(params).promise();

    return {
      statusCode: 200,
      headers: util.getResponseHeaders()
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
