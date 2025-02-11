// Only import types for compile-time checking
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import type { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource'

// Move heavy imports inside the handler
export const postContent = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Lazy load heavy dependencies only when needed
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const fetch = (await import('node-fetch')).default;
    const client = generateClient<Schema>();

    // Get the Cognito identity from the request context
    const cognitoIdentityId = event.requestContext.identity.cognitoIdentityId;
    if (!cognitoIdentityId) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized - No valid identity" }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            }
        };
    }

    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing request body" }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            }
        };
    }

    // Initialize clients only when needed
    const s3Client = new S3Client({
        region: 'ap-east-1',
        maxAttempts: 3  // Add retry strategy
    });

    const body = JSON.parse(event.body);
    const content_type = body.content_type;
    const content_model = body.content_model;
    const content_prompt = body.content_prompt;
    const model_input = JSON.parse(body.model_input);
    console.log("model_input: " + model_input);
    let replicateOutput;

    if (content_model === 'black-forest-labs/flux-schnell') {
        replicateOutput = {
            output: [
                "https://replicate.delivery/xezq/Jy1MmEkOetzSVqiSvndY1uLNKUfR7Wz9iOjifSJNefROQIdgC/out-0.webp"
            ]
        };
    }
    if (content_model === "kwaivgi/kling-v1.6-standard") {
        console.log("start_image: " + model_input.start_image);
        console.log("duration: " + model_input.duration);
        console.log("flexibility: " + model_input.flexibility);
        replicateOutput = {
            output: [
                "https://replicate.delivery/czjl/xFIwsxPXTtpCHJw2WqLH3gqACg3csLVVdKtbLf1heBzXiUJUA/tmp35xuh600.mp4"
            ]
        };
    }

    // Grab the file URL
    const fileUrl = replicateOutput?.output[0];
    if (!fileUrl) {
        throw new Error('No file URL returned from Replicate');
    }

    try {
        // Download the image
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const fileBuffer = Buffer.from(await response.arrayBuffer());

        // Upload to S3
        let s3Key;
        let s3ContentType;
        if (content_type === 'IMAGE') {
            s3Key = `image/${cognitoIdentityId}/${body.content_content}.webp`;
            s3ContentType = "image/webp";
        } else if (content_type === 'VIDEO') {
            s3Key = `video/${cognitoIdentityId}/${body.content_content}.mp4`;
            s3ContentType = "video/mp4";
        }

        // Upload the file
        await s3Client.send(new PutObjectCommand({
            Bucket: 'file.uni-scrm.com',
            Key: s3Key,
            Body: fileBuffer,
            ContentType: s3ContentType,
            Metadata: {
                content_id: body.content_id
            },
        }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    } finally {
        // Cleanup
        s3Client.destroy();
    }
};