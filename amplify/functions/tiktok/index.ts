import type { Handler } from 'aws-lambda';
import authorize from './Login/authorize';

export const handler: Handler = async (event) => {
    if (event.requestContext.http.method === 'GET') {
        console.log('Query parameters:', event.queryStringParameters);

        const code = event.queryStringParameters.code;
        const scopes = event.queryStringParameters.scopes;
        const state = event.queryStringParameters.state;

        await authorize(code);
    } if (event.requestContext.http.method === 'POST') {
        console.log("event:", event);
    } 
}