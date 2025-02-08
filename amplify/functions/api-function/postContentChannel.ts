// Only import types for compile-time checking
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import type { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource'
import axios from 'axios';

// Move heavy imports inside the handler
export const postContentChannel = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const client = generateClient<Schema>();
    const { contentId, channelId } = event.pathParameters || {};
    const cognitoIdentityId = event.requestContext.identity.cognitoIdentityId;

    //get Channel and Content from database
    const { data: channels } = await client.models.Channel.list({
        filter: { id: { eq: channelId } }
    });
    const { data: contents } = await client.models.Content.list({
        filter: { id: { eq: contentId } }
    });

    let postData;
    let config;
    if (channels[0].channel_type === 'TIKTOK' && contents[0].content_type === 'IMAGE') {
        postData = {
            media_type: "PHOTO",
            post_mode: "DIRECT_POST",
            post_info: {
                privacy_level: "SELF_ONLY",
                title: "#hash @mention testTitle",
                brand_organic_toggle: true,
                is_aigc: true
            },
            source_info: {
                "source": "PULL_FROM_URL",
                "photo_cover_index": 0,
                "photo_images": [
                    "https://file.uni-scrm.com/image/" + cognitoIdentityId + "/" + contents[0].content_content + ".webp"
                ]
            }
        };
        config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://open.tiktokapis.com/v2/post/publish/content/init/',
            headers: {
                'Authorization': 'Bearer ' + channels[0].access_token,
                'Content-Type': 'application/json; charset=UTF-8'
            },
            data: JSON.stringify(postData)
        };
    }

    console.log('config:', config);
    if (!config) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Unsupported channel or content type" }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }
        };
    }

    try {
        const response = await axios.request(config);
        console.log(JSON.stringify(response.data));
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to post content" }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }
        };
    }
};