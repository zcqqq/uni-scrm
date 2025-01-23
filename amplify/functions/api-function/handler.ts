import type { APIGatewayProxyHandler } from "aws-lambda";
import { postContent } from "./postContent";
import { getContent } from "./getContent";
import { postChannelContent } from "./postChannelContent";
import { Amplify } from 'aws-amplify';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/api-function";
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);
Amplify.configure(resourceConfig, libraryOptions);

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);
  if(event.httpMethod === "POST" && event.path === "/content") {
    return postContent(event);
  } 
  else if(event.httpMethod === "GET" && event.path === "/content") {
    return getContent(event);
  }
  else if(event.httpMethod === "POST" && event.path === "/channel") {
    return postChannelContent(event);
  }
  else {
  return {
    statusCode: 200,
    // Modify the CORS settings below to match your specific requirements
    headers: {
      "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
      "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
    },
    body: JSON.stringify("Hello from myFunction!"),
  }};
};