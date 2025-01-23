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

    if (!contentId || !channelId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing contentId or channelId" }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }
        };
    }
    console.log('Processing content for channel:', channelId);
    
     //get Channel.access_token from database
     const { data: channels } = await client.models.Channel.list({
        filter: { id: { eq: channelId } }
    });
    const access_token = channels[0].access_token;

    //get Content.video_url from database
    const { data: contents } = await client.models.Content.list({
        filter: { id: { eq: contentId } }
    });
    const content_content = contents[0].content_content;

    const postData = {
        post_info: {
            privacy_level: "SELF_ONLY",
            title: "#hash @mention testTitle",
            brand_organic_toggle: true,
            is_aigc: true
        },
        source_info: {
            source: "PULL_FROM_URL",
            video_url: "https://file.uni-scrm.com/"+content_content}
    };

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/',
        headers: {
            'Authorization': 'Bearer '+access_token,
            'Content-Type': 'application/json; charset=UTF-8'
        },
        data: postData
    };

    console.log('config:', config);

    axios.request(config)
        .then((response: any) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error: any) => {
            console.log(error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Failed to post content" }),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                }
            };
        });

    return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }
    };
};