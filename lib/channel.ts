import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export const channelBackend = {
    listChannels: async () => {
        const { data } = await client.models.Channel.list({
            filter: { is_deleted: { eq: false } }
        });
        return data;
    },
    getChannel: async (id: string) => {
        try {
            const result = await client.models.Channel.get({ id });
            if (!result) {
                console.error('No result from Channel.get');
                return null;
            }
            return result.data;
        } catch (error) {
            console.error('Error getting channel:', error);
            return null;
        }
    },
};
