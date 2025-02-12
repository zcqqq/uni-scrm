import { defineFunction, secret } from '@aws-amplify/backend';

export const myApiFunction = defineFunction({
  name: "api-function",
  timeoutSeconds: 60,
  environment: {
    REPLICATE_API_TOKEN: secret('REPLICATE_API_TOKEN'),
    CALLBACK_HOST: "https://5808-103-196-26-212.ngrok-free.app",
  }
});