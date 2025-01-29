import { post } from 'aws-amplify/api';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();
interface ImageGenerationParams {
  model: string;
  campaign: string;
  prompt: string;
  quality: string;
  width: number;
  height: number;
}
interface VideoGenerationParams {
  prompt: string;
  quality?: string;
  style?: string;
  size?: string;
}

export const contentBackend = {
  postContentImage: async (values: ImageGenerationParams) => {
    console.log('values', values);
    const content = {
      content_type: 'IMAGE',
      content_campaign: values.campaign,
      content_model: values.model,
      content_prompt: values.prompt,
      content_quality: values.quality,
      content_width: values.width,
      content_height: values.height,
    };
    console.log('content:', JSON.stringify(content, null, 2));
    const { data: createdContent, errors } = await client.models.Content.create(content, { authMode: 'userPool' });
    console.log('createdContent:', JSON.stringify(createdContent, null, 2));  // Pretty print the entire object
    console.log('errors:', errors);

    /*try {
      const restOperation = post({
        apiName: 'myRestApi',
        path: 'content',
        options: {
          body: {
            content_type: "IMAGE",
            model: values.model,
            campaign: values.campaign,
            prompt: values.prompt,
            quality: values.quality,
            //width: values.width.toString(),
            //height: values.height.toString(),
          }
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      console.log('POST call succeeded');
      console.log(response);
    } catch (error: any) {
      console.log('POST call failed: ', JSON.parse(error.response.body));
    }*/
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
