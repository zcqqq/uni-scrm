import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';
import { AxiosResponse } from 'axios';
import { channelBackend } from '../../backend';

const client = generateClient<Schema>();
export const tiktokBackend = {
    refreshToken: async (id: string) => {
        const channelData = await channelBackend.getChannel(id as string);

        //Postman start
        const axios = require('axios');
        const qs = require('qs');
        let data = qs.stringify({
            'client_key': 'sbawqxclmj4epo0txj',
            'client_secret': 'otJCWnI0je36MF4BpxhNhERYV1xRCu7q',
            'grant_type': 'refresh_token',
            'refresh_token': channelData?.refresh_token
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://open.tiktokapis.com/v2/oauth/token/',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const response = await axios.request(config);
        if (!channelData) return;
        
        const { data: updatedChannel, errors } = await client.models.Channel.update({
            id: channelData.id,
            access_token: response.data.access_token
        });
        
    }
};
