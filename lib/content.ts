import { post } from 'aws-amplify/api';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();
interface contentParams {
  model: string;
  campaign: string;
  prompt: string;
  quality: string;
  ratio: string;
  width: number;
  height: number;
}

interface contentChannelParams {
  content_id: string;
  content_type: string;
  channel_id: string;
  channel_type: string;
}

export const contentBackend = {
  postContentImage: async (params: contentParams) => {

    try {
      let requestBody;
      if (params.model === 'black-forest-labs/flux-schnell') {
        type QualityType = 'NORMAL' | 'HIGH';
        const qualitySettings = {
          'NORMAL': { go_fast: 'true', megapixels: '1', num_outputs: '1', output_quality: '80', num_inference_steps: '1' },
          'HIGH': { go_fast: 'false', megapixels: '10', num_outputs: '4', output_quality: '100', num_inference_steps: '4' },
        };

        const settings = qualitySettings[params.quality as QualityType] || qualitySettings['NORMAL'];

        requestBody = {
          model: params.model,
          prompt: params.prompt,
          ...settings
        };
      }

      const restOperation = post({
        apiName: 'myRestApi',
        path: 'content',
        options: {
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json'
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
  postContentVideo: async (params: contentParams) => {
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

  postContentChannelImageTiktok: async (params: contentChannelParams) => {
    const requestBody = {
      content_type: params.content_type,
      channel_type: params.channel_type
    };

    try {
      const restOperation = post({
        apiName: 'myRestApi',
        path: `content/${params.content_id}/channel/${params.channel_id}`,
        options: {
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json'
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
  }
};
