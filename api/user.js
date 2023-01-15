'use strict';
 
const uuid = require('uuid');
const AWS = require('aws-sdk'); 
 
AWS.config.setPromisesDependency(require('bluebird'));
 
const dynamoDb = new AWS.DynamoDB.DocumentClient();
 

const userInfo = (user) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    ...user,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};

const submitUser = user => {
  console.log('Submitting user');
  const userInfo = {
    TableName: 'user',
    Item: user,
  };
  return dynamoDb.put(userInfo).promise()
    .then(res => user);
};


/* 
TODO:
1. Request Payload validation
2. Enable Authorization
3. Enable cors policy
*/
const submit = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
 
  submitUser(userInfo(requestBody))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted user with email ${email}`,
          userId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit user with email ${email}`
        })
      })
    });
};

const getByEmail = (event, context, callback) => {

  const { pathParameters: { email } } = event;

  const params = {
    TableName: 'user',
    FilterExpression: "email = :email",
    // KeyConditionExpression: "email = :a",
    ExpressionAttributeValues: {
        ":email": email,
    }
  };
 
  dynamoDb.scan(params).promise()
    .then(result => {
      console.log('result', result);
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Items),
      };
      console.log('response', response);
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('Couldn\'t fetch candidate.'));
      return;
    });

};

module.exports = {
  submit,
  getByEmail
}