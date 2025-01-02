import { defineFunction, secret } from '@aws-amplify/backend';
import { ProcessorMode } from 'aws-cdk-lib/aws-stepfunctions';

export const weixinWork = defineFunction({
  name: 'weixinWork',
  entry: './weixinWork/index.ts'
});

export const tiktok = defineFunction({
  name: 'tiktok',
  entry: './tiktok/index.ts',
  environment: {
    callback: String(process.env.NEXT_PUBLIC_CALLBACK),
    tiktok_clientKey: String(process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY),
    tiktok_clientSecret: secret('TIKTOK_CLIENT_SECRET'),
    tiktok_host: "https://open.tiktokapis.com",
  }
});

