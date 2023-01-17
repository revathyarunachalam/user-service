'use strict';
 
const uuid = require('uuid');
const AWS = require('aws-sdk'); 
 
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
const submit = (event) => {
  const requestBody = JSON.parse(event.body);
 
  submitUser(userInfo(requestBody))
    .then(res => {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted user with email ${email}`,
          userId: res.id
        })
      }
    })
    .catch(err => {
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit user with email ${email}`
        })
      }
    });
};

const getById = (event) => {

  const { pathParameters: { id } } = event;

  const params = {
    TableName: 'user',
    Key: {
      id: id,
    },
  };
  
  return dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
      return response;
    })
    .catch(error => {
      console.error(error);
      return new Error('Couldn\'t fetch candidate.')
    });

};

const updateUser = (event) => {
  const { pathParameters: { id } } = event;
  const requestBody = JSON.parse(event.body);
  const timestamp = new Date().getTime();

  
  return submitUser({
    id: id,
    ...requestBody,
    updatedAt: timestamp,
  })
    .then(res => {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully updated`,
          userId: res.id
        })
      }
    })
    .catch(err => {
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to udpate ${err}`
        })
      }
    });
}

module.exports = {
  submit,
  getById,
  updateUser
}