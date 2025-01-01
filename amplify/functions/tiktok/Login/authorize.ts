import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../../amplify/data/resource'
import { env } from '$amplify/env/tiktok';

export default async function authorize(code: String) {
    const client = generateClient<Schema>();
    
    //call API https://developers.tiktok.com/doc/oauth-user-access-token-management
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
        'client_key': env.tiktok_clientKey,
        'client_secret': env.tiktok_clientSecret,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': env.tiktok_redirectUri
    });
    var config = {
        method: 'post',
        url: env.tiktok_host + '/v2/oauth/token/',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };
    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data));

        //upsert Channel in database
        const { data: channels } = await client.models.Channel.list({
            filter: { channel_id: { eq: response.data.open_id } }
        });
        if (channels.length > 0) {
            const channel = {
                id: channels[0].id,
                is_deleted: false,
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                scope: response.data.scope,
            };
            const { data: updatedChannel, errors } = await client.models.Channel.update(channel);
            console.log('updatedChannel: ' + updatedChannel);
        } else {
            const channel = {
                channel_type: "TIKTOK",
                channel_id: response.data.open_id,
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                scope: response.data.scope,
            };
            const { data: createdChannel, errors } = await client.models.Channel.create(channel);
            console.log('createdChannel: ' + createdChannel);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success' })
        };
    } catch (error: any) {
        console.log('error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}