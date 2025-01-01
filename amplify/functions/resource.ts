import { defineFunction, secret } from '@aws-amplify/backend';

export const weixinWork = defineFunction({
  name: 'weixinWork',
  entry: './weixinWork/index.ts'
});

export const tiktok = defineFunction({
  name: 'tiktok',
  entry: './tiktok/index.ts',
  environment: {
    tiktok_host: "https://open.tiktokapis.com",
    tiktok_clientKey: "sbawqxclmj4epo0txj",
    tiktok_clientSecret: "otJCWnI0je36MF4BpxhNhERYV1xRCu7q",
    tiktok_redirectUri: "https://imh484s1bh.execute-api.us-east-1.amazonaws.com/tiktok"
  }
});

