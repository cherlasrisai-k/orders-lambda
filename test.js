const lambda = require("./index");

const event = {

    httpMethod: "GET",

    body: JSON.stringify({
        customerId: 101
    })
};

lambda.handler(event)
.then(console.log);