// Only import types for compile-time checking
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import type { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../data/resource'
import axios from 'axios';

// Move heavy imports inside the handler
export const postContentPublish = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const client = generateClient<Schema>();
    const contentPublishId = event.path.split("/")[2];
    const cognitoIdentityId = event.requestContext.identity.cognitoIdentityId;

    if (!contentPublishId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing contentPublishId" }),
            headers: { "Access-Control-Allow-Origin": "*" }
        };
    }

    //get ContentPublish from database
    const { data: contentPublish } = await client.models.ContentPublish.get({ id: contentPublishId });
    if (!contentPublish) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: "ContentPublish not found" }),
            headers: { "Access-Control-Allow-Origin": "*" }
        };
    }
    const {data: content} = await contentPublish.content();
    const {data: channel} = await contentPublish.channel();

    let postData;
    let config;
    if (channel?.channel_type === 'TIKTOK' && content?.content_type === 'IMAGE') {
        postData = {
            media_type: "PHOTO",
            post_mode: "DIRECT_POST",
            post_info: {
                privacy_level: "SELF_ONLY",
                title: content?.content_title,
                brand_organic_toggle: true,
                is_aigc: true
            },
            source_info: {
                "source": "PULL_FROM_URL",
                "photo_cover_index": 0,
                "photo_images": [
                    "https://file.uni-scrm.com/image/" + cognitoIdentityId + "/" + content?.content_content + ".webp"
                ]
            }
        };
        config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://open.tiktokapis.com/v2/post/publish/content/init/',
            headers: {
                'Authorization': 'Bearer ' + channel?.access_token,
                'Content-Type': 'application/json; charset=UTF-8'
            },
            data: JSON.stringify(postData)
        };
    } else if (channel?.channel_type === 'TIKTOK' && content?.content_type === 'VIDEO') {
        postData = {
            post_info: {
                privacy_level: "SELF_ONLY",
                title: content?.content_title,
                brand_organic_toggle: true,
                is_aigc: true
            },
            source_info: {
                "source": "PULL_FROM_URL",
                "video_url":"https://file.uni-scrm.com/video/" + cognitoIdentityId + "/" + content?.content_content + ".webp"
            }
        };
        config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://open.tiktokapis.com/v2/post/publish/video/init/',
            headers: {
                'Authorization': 'Bearer ' + channel?.access_token,
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
        const { data: updatedContentPublish, errors } = await client.models.ContentPublish.update({
            id: contentPublishId,
            publish_id: response.data.data.publish_id
        });
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