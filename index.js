const {
    DynamoDBClient
} = require("@aws-sdk/client-dynamodb");

const {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand
} = require("@aws-sdk/lib-dynamodb");
    
console.log("Lambda initialized");

//Dynamodb 
const client =
    new DynamoDBClient({
        region: "ap-south-1"
    });

const docClient =
    DynamoDBDocumentClient.from(client);

const TABLE_NAME =
    "CustomerOrders";


//Lambda Handler
exports.handler = async (event) => {

    console.log(
        "EVENT:",
        JSON.stringify(event)
    );

    try {

        const method = event.httpMethod;

        const body =
    typeof event.body === "string"
        ? JSON.parse(event.body)
        : event;

let {
    customerId,
    orderId,
    amount,
    product
} = body;

       if(method == "GET") {

        if (
            customerId
        ) {

            customerId =
                Number(customerId);

            const dbResponse =
                await docClient.send(
                    new QueryCommand({

                        TableName:
                        TABLE_NAME,

                        KeyConditionExpression:
                        "customerId = :cid",

                        ExpressionAttributeValues: {

                            ":cid":
                            customerId
                        }
                    })
                );
            console.log("Get Request");
            return response(
                200,
                {
                    message:
                    "Orders fetched successfully",

                    orders:
                    dbResponse.Items
                }
            );
        }
    }
        
        if(method == "PUT") {
        if (
            customerId &&
            orderId &&
            amount &&
            product
        ) {

            const item = {

                customerId:
                Number(customerId),

                orderId:
                Number(orderId),

                amount:
                Number(amount),

                product
            };
            console.log("Put Request");
            await docClient.send(
                new PutCommand({

                    TableName:
                    TABLE_NAME,

                    Item: item
                })
            );

            return response(
                201,
                {
                    message:
                    "Order created successfully",

                    order: item
                }
            );
        }

        
        console.log("Invalid Input");
        return response(
            400,
            {
                error:
                "Invalid input"
            }
        );
    }
    } catch (error) {

        console.error(error);

        return response(
            500,
            {
                error:
                error.message
            }
        );
    }
};



function response(
    statusCode,
    body
) {
    console.log("Response");
    return {

        statusCode,

        headers: {

            "Content-Type":
            "application/json"
        },

        body:
        JSON.stringify(body)
    };
}