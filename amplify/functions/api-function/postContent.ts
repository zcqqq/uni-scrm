// Only import types for compile-time checking
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import type { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource'
import Replicate from "replicate";
import { env } from '$amplify/env/api-function';

interface ReplicateOutput {
    output: string[];
}

// Move heavy imports inside the handler
export const postContent = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Lazy load heavy dependencies only when needed
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const fetch = (await import('node-fetch')).default;
    const client = generateClient<Schema>();
    const contentId = event.path.split("/")[2];

    // Get the Cognito identity from the request context
    const cognitoIdentityId = event.requestContext.identity.cognitoIdentityId;
    if (!event.body) throw new Error("Missing request body");
    const body = JSON.parse(event.body);
    const content_type = body.content_type;
    const content_model = body.content_model;
    console.log("model input: " + JSON.stringify(body.model_input));

    // call Replicate API
    let model_input = body.model_input;
    const replicate = new Replicate({ auth: env.REPLICATE_API_TOKEN });
    let prediction = await replicate.predictions.create({model: content_model, input: model_input,webhook:env.CALLBACK_HOST+'/callback/replicate', webhook_events_filter:['completed']});
    console.log("prediction: " + JSON.stringify(prediction));
    const { data: updatedContent, errors } = await client.models.Content.update({
        id: contentId,
        generation_id: prediction.id,
    });
    return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
        headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" }
    };
};