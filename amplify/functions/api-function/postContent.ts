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
    const prompt = body.prompt;

    const replicateOutput = {
        output: [
            "https://replicate.delivery/xezq/Jy1MmEkOetzSVqiSvndY1uLNKUfR7Wz9iOjifSJNefROQIdgC/out-0.webp"
        ]
    };

    // Grab the image URL
    const imageUrl = replicateOutput.output[0];

    try {
        // Download the image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const imageBuffer = Buffer.from(await response.arrayBuffer());

        // Upload to S3
        const s3Key = `public/${prompt}.webp`;

        // First upload the file
        await s3Client.send(new PutObjectCommand({
            Bucket: 'file.uni-scrm.com',
            Key: s3Key,
            Body: imageBuffer,
            ContentType: "image/webp",
        }));

        const content = {
            content_type: 'IMAGE',
            content_content: s3Key,
            content_campaign: body.campaign,
            content_model: body.model,
            content_prompt: body.prompt,
            content_quality: body.quality,
            content_width: body.width,
            content_height: body.height,
        };
        console.log('content:', JSON.stringify(content, null, 2));
        const { data: createdContent, errors } = await client.models.Content.create(content, { authMode: 'userPool' });
        console.log('createdContent:', JSON.stringify(createdContent, null, 2));  // Pretty print the entire object
        console.log('errors:', errors);

        // After getting the content_id, update the S3 object with metadata
        if (createdContent?.id) {
            await s3Client.send(new PutObjectCommand({
                Bucket: 'file.uni-scrm.com',
                Key: s3Key,
                Body: imageBuffer,
                ContentType: "image/webp",
                Metadata: {
                    content_id: createdContent.id
                },
            }));
        }

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