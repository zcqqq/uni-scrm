import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";
import { cookiesClient } from "@/utils/amplify-utils";
import axios from 'axios';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const contentPublishId = params.id;
    console.log('contentPublishId: ' + contentPublishId);

    //get ContentPublish from database
    const { data: contentPublish } = await cookiesClient.models.ContentPublish.get({ id: contentPublishId }, { authMode: 'userPool' });
    if (!contentPublish) { return NextResponse.json({ status: 404 }); }
    const { data: content } = await contentPublish.content();
    const { data: channel } = await contentPublish.channel();

    let postData;
    let config;
    if (channel?.channel_type === 'TIKTOK' && content?.content_type === 'IMAGE') {
        postData = {
            media_type: "PHOTO",
            post_mode: "DIRECT_POST",
            post_info: {
                privacy_level: "SELF_ONLY",
                brand_organic_toggle: true,
                is_aigc: true
            },
            source_info: {
                "source": "PULL_FROM_URL",
                "photo_cover_index": 0,
                "photo_images": [
                    "https://file.uni-scrm.com/image/" + content?.folder_id + "/" + content?.content_files?.[0] + ".webp"
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
                brand_organic_toggle: true,
                is_aigc: true
            },
            source_info: {
                "source": "PULL_FROM_URL",
                "video_url": "https://file.uni-scrm.com/video/" + content?.folder_id + "/" + content?.content_files?.[0] + ".mp4"
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
        return NextResponse.json({ status: 400 });
    }

    try {
        const response = await axios.request(config);
        const { data: updatedContentPublish, errors } = await cookiesClient.models.ContentPublish.update({
            id: contentPublishId,
            publish_id: response.data.data.publish_id
        }, { authMode: 'userPool' });
        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ status: 500 });
    }
};