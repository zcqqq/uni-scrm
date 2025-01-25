import { post } from 'aws-amplify/api';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export const contentBackend = {
  postContentImage: async (prompt: string) => {
    try {
      const restOperation = post({
        apiName: 'myRestApi',
        path: 'content',
        options: {
          body: {
            message: prompt
          }
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      console.log('POST call succeeded');
      console.log(response);
    } catch (error: any) {
      console.log('POST call failed: ', JSON.parse(error.response.body));
    }
  },
  postContentVideo: async (prompt: string) => {
    try {
      const restOperation = post({
        apiName: 'myRestApi',
        path: 'content',
        options: {
          body: {
            message: prompt
          }
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      console.log('POST call succeeded');
      console.log(response);
    } catch (error: any) {
      console.log('POST call failed: ', JSON.parse(error.response.body));
    }
  },
};
