import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { weixinWork } from './functions/resource';
import { tiktok } from './functions/resource';
import { storage } from './storage/resource';
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  data,
  //storage, //can't co-exist with own bucket
  weixinWork,
  tiktok,
});

// own bucket essential for tiktok upload
backend.addOutput({
  storage: {
    bucket_name: "file.uni-scrm.com",
    aws_region: "ap-east-1",
  },
});
