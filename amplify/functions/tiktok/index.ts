import type { Handler } from 'aws-lambda';
import authorize from './Login/authorize';
import refresh_token from './Login/refresh_token';
import { Amplify } from 'aws-amplify';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/tiktok";
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);
Amplify.configure(resourceConfig, libraryOptions);

export const handler: Handler = async (event) => {
    if (event.requestContext.http.method === 'GET') {
        console.log('Query parameters:', event.queryStringParameters);

        const code = event.queryStringParameters.code;
        const scopes = event.queryStringParameters.scopes;
        const state = event.queryStringParameters.state;

        await authorize(code);
    } else if (event.requestContext.http.method === 'POST') {
        const body = JSON.parse(event.body || '{}');
        if (body.action === 'refresh_token') {
            return await refresh_token(body.refresh_token);
        }
    } 
}