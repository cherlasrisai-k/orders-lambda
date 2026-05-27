const {
    DynamoDBClient
} = require("@aws-sdk/client-dynamodb");

const {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand
} = require("@aws-sdk/lib-dynamodb");

console.log("Lambda initialized");


const client = new DynamoDBClient({
    region: "ap-south-1"
});

const docClient =
    DynamoDBDocumentClient.from(client);

const TABLE_NAME = "CustomerOrders";


exports.handler = async (event) => {

    console.log(
        "EVENT:",
        JSON.stringify(event)
    );

    try {

        const method =
            event.httpMethod;

        
        const body =
            typeof event.body === "string"
                ? JSON.parse(event.body)
                : event.body || {};

        let {
            customerId,
            orderId,
            amount,
            product
        } = body;

        
        if (method === "GET") {

            
            customerId =
                event.queryStringParameters?.customerId ||
                customerId;

            if (!customerId) {

                console.log(
                    "customerId missing"
                );

                return response(
                    400,
                    {
                        error:
                            "customerId is required"
                    }
                );
            }

            customerId =
                Number(customerId);

            console.log(
                `Fetching orders for customerId: ${customerId}`
            );

            const dbResponse =
                await docClient.send(
                    new QueryCommand({

                        TableName:
                            TABLE_NAME,

                        KeyConditionExpression:
                            "customerId = :cid",

                        ExpressionAttributeValues: {
                            ":cid": customerId
                        }
                    })
                );

            
            if (
                !dbResponse.Items ||
                dbResponse.Items.length === 0
            ) {

                console.log(
                    "No orders found"
                );

                return response(
                    404,
                    {
                        message:
                            "No orders found"
                    }
                );
            }

            console.log(
                "Orders fetched successfully"
            );

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

        
        else if (method === "PUT") {

            if (
                !customerId ||
                !orderId ||
                !amount ||
                !product
            ) {

                console.log(
                    "Invalid input"
                );

                return response(
                    400,
                    {
                        error:
                            "customerId, orderId, amount and product are required"
                    }
                );
            }

            const item = {

                customerId:
                    Number(customerId),

                orderId:
                    Number(orderId),

                amount:
                    Number(amount),

                product
            };

            console.log(
                "Creating order:",
                JSON.stringify(item)
            );

            await docClient.send(
                new PutCommand({

                    TableName:
                        TABLE_NAME,

                    Item: item
                })
            );

            console.log(
                "Order created successfully"
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

        
        else {

            console.log(
                `Unsupported method: ${method}`
            );

            return response(
                405,
                {
                    error:
                        "Method Not Allowed"
                }
            );
        }

    } catch (error) {

        console.error(
            "ERROR:",
            error
        );

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

    console.log(
        "Sending Response:",
        statusCode
    );

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