import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from 'process';
import { cookiesClient } from "@/utils/amplify-utils";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    const scopes = request.nextUrl.searchParams.get('scopes');
    const state = request.nextUrl.searchParams.get('state');
    console.log('code: ' + code);
    console.log('scopes: ' + scopes);
    console.log('state: ' + state);

    let axios;
    let qs;
    try {
        axios = require('axios');
        qs = require('qs');
    } catch (error) {
        console.error('Failed to load axios:', error);
        throw new Error('Dependencies failed to load');
    }
    var data = qs.stringify({
        'client_key': process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY,
        'client_secret': process.env.TIKTOK_CLIENT_SECRET,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': process.env.NEXT_PUBLIC_CALLBACK_HOST + '/callback/tiktok'
    });
    var config = {
        method: 'post',
        url: 'https://open.tiktokapis.com/v2/oauth/token/',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };
    try {
        console.log('config:', config);
        const response = await axios(config);
        console.log(JSON.stringify(response.data));

        //upsert Channel in database
        const { data: channels } = await cookiesClient.models.Channel.listChannelByChannel_id({
            channel_id: response.data.open_id
        }, { authMode: 'userPool' });
        if (channels.length > 0) {
            const channel = {
                id: channels[0].id,
                is_deleted: false,
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                scope: response.data.scope,
            };
            const { data: updatedChannel, errors: updatedChannelErrors } = await cookiesClient.models.Channel.update(channel, { authMode: 'userPool' });
            if (updatedChannelErrors) console.error('updatedChannelErrors:', JSON.stringify(updatedChannelErrors, null, 2));
        } else if (response.data.open_id) {
            const channel = {
                channel_type: "TIKTOK",
                channel_id: response.data.open_id,
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                scope: response.data.scope,
            };
            const { data: createdChannel, errors: createdChannelErrors } = await cookiesClient.models.Channel.create(channel, { authMode: 'userPool' });
            if (createdChannelErrors) console.error('createdChannelErrors:', JSON.stringify(createdChannelErrors, null, 2));
        }

        return NextResponse.redirect(new URL(process.env.NEXT_PUBLIC_CALLBACK_HOST + '/channel', request.url));
    } catch (error: any) {
        console.log('error:', error);
        return NextResponse.redirect(new URL(process.env.NEXT_PUBLIC_CALLBACK_HOST + '/channel', request.url));
    }
}