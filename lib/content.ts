import { post } from 'aws-amplify/api';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();
interface ImageGenerationParams {
  prompt: string;
  quality?: string;
  style?: string;
  size?: string;
}
interface VideoGenerationParams {
  prompt: string;
  quality?: string;
  style?: string;
  size?: string;
}

export const contentBackend = {
  postContentImage: async (values: any) => {
    console.log('values', values);
    try {
      const restOperation = post({
        apiName: 'myRestApi',
        path: 'content',
        options: {
          body: {
            message: "test",
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
  postContentVideo: async (params: VideoGenerationParams) => {
    try {
      const restOperation = post({
        apiName: 'myRestApi',
        path: 'content',
        options: {
          body: {
            message: params.prompt,
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
