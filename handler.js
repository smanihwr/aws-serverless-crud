'use strict';

const AWS = require('aws-sdk')

module.exports = {
    create: async(event, context) => {
        let bodyObj = {}
        try {
            bodyObj = JSON.parse(event.body)
        } catch (jsonError) {
            console.log('Error parsing request body', jsonError)
            return {
                statusCode: 400
            }
        }

        if(typeof bodyObj.name === "undefined" ||
            typeof bodyObj.age === "undefined") {
            console.log('Missing parameters')
            return {
                statusCode: 400
            }
        }

        let putParams = {
            TableName: process.env.DYNAMO_KITTEN_TABLE,
            Item: {
                name: bodyObj.name,
                age: bodyObj.age
            }
        }

        let putResult = {}
        try {
            let dynamoDB = new AWS.DynamoDB.DocumentClient()
            putResult = await dynamoDB.put(putParams).promise()
        } catch (putError) {
            console.log('Error while putting a kitten ')
            console.log('putParams ', putParams)
            return {
                statusCode: 500
            }
        }

        return {
            statusCode: 201
        }

    },

    list: async(event, context) => {
        let scanParams = {
            TableName: process.env.DYNAMO_KITTEN_TABLE
        }

        let scanResult = {}
        try {
          let dynamoDB = new AWS.DynamoDB.DocumentClient()
          scanResult = await dynamoDB.scan(scanParams).promise()
        } catch (e) {
            console.log('Error while listing a kitten ')
            console.log('scanParams ', scanParams)
            return {
                statusCode: 500
            }
        }

        if(scanResult.Items === null ||
        !Array.isArray(scanResult.Items) ||
        scanResult.Items.length === 0) {
            return {
                statusCode: 404
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(scanResult.Items.map(kitten => {
                return {
                    name: kitten.name,
                    age: kitten.age
                }
            }))
        }
    },
    get: async(event, context) => {
        let getParams = {
            TableName: process.env.DYNAMO_KITTEN_TABLE,
            Key: {
               name: event.pathParameters.name
            }
        }
        
        let getResult = {}
        try {
            let dynamoDB = new AWS.DynamoDB.DocumentClient()
            getResult = await dynamoDB.get(getParams).promise()
            console.log('[*] Success', getResult);
        } catch (e) {
            console.log('Error while getting a kitten ')
            console.log('getError ', e)
            return {
                statusCode: 500
            }
        }

        if(getResult === null) {
            return {
                statusCode: 404
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                name: getResult.Item.name,
                age: getResult.Item.age,
            })
        }
    },

    update: async(event, context) => {

        let bodyObj = {}
        try {
            bodyObj = JSON.parse(event.body)
        } catch (jsonError) {
            console.log('Error parsing request body', jsonError)
            return {
                statusCode: 400
            }
        }

        if(typeof bodyObj.age === "undefined") {
            console.log('Missing parameters')
            return {
                statusCode: 400
            }
        }

        let updateParams = {
            TableName: process.env.DYNAMO_KITTEN_TABLE,
            Key: {
                name: event.pathParameters.name
            },
            UpdateExpression: 'set #age = :age',
            ExpressionAttributeNames: {
                '#age':'age'
            },
            ExpressionAttributeValues: {
                ':age': bodyObj.age
            }
        }

        try {
            let dynamoDB = new AWS.DynamoDB.DocumentClient()
            await dynamoDB.get(updateParams).promise()
        } catch (e) {
            console.log('Error while updating a kitten ')
            console.log('updateError ', e)
            return {
                statusCode: 500
            }
        }

        return {
            statusCode: 200
        }
    },

    delete: async(event, context) => {
        let deleteParams = {
            TableName: process.env.DYNAMO_KITTEN_TABLE,
            Key: {
                name: event.pathParameters.name
            }
        }

        try {
            let dynamoDB = new AWS.DynamoDB.DocumentClient()
            await dynamoDB.delete(deleteParams).promise()
        } catch (e) {
            console.log('Error while deleting a kitten ')
            console.log('deleteError ', e)
            return {
                statusCode: 500
            }
        }

        return {
            statusCode: 200
        }
    }

}