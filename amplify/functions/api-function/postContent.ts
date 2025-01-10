import { APIGatewayProxyEvent } from "aws-lambda";
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource'
import Replicate from "replicate";
import { writeFile } from "node:fs/promises";

//body: {
//    content_type: "IMAGE",
//}

export const postContent = async (event: APIGatewayProxyEvent) => {
    const client = generateClient<Schema>();
    console.log("event", event);

    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing request body" })
        };
    }
    const body = JSON.parse(event.body);


    const content = {
        content_type: body.content_type,
    };
    const { data: createdContent, errors } = await client.models.Content.create(content);
    console.log('createdContent: ' + createdContent);
    
    if (!createdContent) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to create content" })
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ id: createdContent.id }),
    };
};