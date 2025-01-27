import type { Handler } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/replicate";
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);
Amplify.configure(resourceConfig, libraryOptions);

export const handler: Handler = async (event) => {
    if (event.requestContext.http.method === 'GET') {
        console.log('event', event);
    } else if (event.requestContext.http.method === 'POST') {
        console.log('event', event);
    } 
}