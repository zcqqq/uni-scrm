import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export const backend = {
    fetchChannels: async () => {
        const { data } = await client.models.Channel.list({
            filter: { is_deleted: { eq: false } }
        });
        return data;
    },
};
