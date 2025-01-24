import { post } from 'aws-amplify/api';

export async function postContentVideo(prompt:string) {
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
}