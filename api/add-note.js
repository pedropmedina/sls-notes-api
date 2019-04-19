/* eslint-disable no-console */

/**
 * Route: POST / note
 */

const uuidv4 = require('uuid/v4');
const moment = require('moment');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-2' });

const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tablename = process.env.NOTES_TABLE;

exports.handler = async event => {
  try {
    let item = JSON.parse(event.body).Item;
    item.user_id = util.getUserId(event.headers);
    item.user_name = util.getUserName(event.headers);
    item.note_id = item.user_id + ':' + uuidv4();
    item.timestamp = moment().unix();
    item.expires = moment()
      .add(90, 'days')
      .unix();

    await dynamodb
      .put({
        TableName: tablename,
        Item: item
      })
      .promise();

    return {
      statusCode: 200,
      headers: util.getResponseHeaders(),
      body: JSON.stringify(item)
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
