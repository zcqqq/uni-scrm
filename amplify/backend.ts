import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { replicate } from './functions/resource';
import { weixinWork } from './functions/resource';
import { tiktok } from './functions/resource';
import { storage } from './storage/resource';
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { myApiFunction } from "./functions/api-function/resource";

const backend = defineBackend({
  auth,
  data,
  //storage, //can't co-exist with own bucket
  myApiFunction,
  replicate,
  weixinWork,
  tiktok,
});

// own bucket essential for tiktok upload
backend.addOutput({
  storage: {
    bucket_name: "file.uni-scrm.com"
  },
});

// create a new API stack
const apiStack = backend.createStack("api-stack");

// create a new REST API
const myRestApi = new RestApi(apiStack, "RestApi", {
  restApiName: "myRestApi",
  deploy: true,
  deployOptions: {
    stageName: "dev",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: ['*'],  // Allow all headers
    allowCredentials: true,
  },
});

// create a new Lambda integration
const lambdaIntegration = new LambdaIntegration(
  backend.myApiFunction.resources.lambda
);

// create a new resource path with IAM authorization
const contentPath = myRestApi.root.addResource("content", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.IAM,
  },
});
const contentIdPath = contentPath.addResource("{contentId}");
contentIdPath.addMethod("POST", lambdaIntegration);

const contentPublishPath = myRestApi.root.addResource("contentPublish", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.IAM,
  },
});
const contentPublishIdPath = contentPublishPath.addResource("{contentPublishId}");
contentPublishIdPath.addMethod("POST", lambdaIntegration);

// create a new Cognito User Pools authorizer
const cognitoAuth = new CognitoUserPoolsAuthorizer(apiStack, "CognitoAuth", {
  cognitoUserPools: [backend.auth.resources.userPool],
});
// create a new resource path with Cognito authorization
const booksPath = myRestApi.root.addResource("cognito-auth-path");
booksPath.addMethod("GET", lambdaIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuth,
});

// create a new IAM policy to allow Invoke access to the API
const apiRestPolicy = new Policy(apiStack, "RestApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${myRestApi.arnForExecuteApi("*", "/content/*", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/contentPublish/*", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/cognito-auth-path", "dev")}`,
      ],
    }),
  ],
});

// attach the policy to the authenticated and unauthenticated IAM roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [myRestApi.restApiName]: {
        endpoint: myRestApi.url,
        region: Stack.of(myRestApi).region,
        apiName: myRestApi.restApiName,
      },
    },
  },
});
