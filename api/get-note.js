/* eslint-disable no-console */

/**
 * Route: GET /note/n/{note_id}
 */

const R = require('ramda');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });

const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tablename = process.env.NOTES_TABLE;

exports.handler = async event => {
  try {
    let note_id = decodeURIComponent(event.pathParameters.note_id);

    let params = {
      TableName: tablename,
      IndexName: 'note_id-index',
      KeyConditionExpression: 'note_id = :note_id',
      ExpressionAttributeValues: { ':note_id': note_id },
      Limit: 1
    };

    let data = await dynamodb.query(params).promise();

    if (!R.isEmpty(data.Items)) {
      return {
        statusCode: 200,
        headers: util.getResponseHeaders(),
        body: JSON.stringify(data)
      };
    } else {
      return {
        statusCode: 404,
        headers: util.getResponseHeaders()
      };
    }
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
