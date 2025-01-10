import { APIGatewayProxyEvent } from "aws-lambda";

export const getContent = async (event: APIGatewayProxyEvent) => {
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify("Hello from getContent!"),
    };
};