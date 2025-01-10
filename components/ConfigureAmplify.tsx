// components/ConfigureAmplify.tsx
"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { fetchAuthSession } from 'aws-amplify/auth'
import { AuthorizationToken } from "aws-cdk-lib/aws-ecr";


Amplify.configure(outputs, { ssr: true });
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.API,
  },
});

export default function ConfigureAmplifyClientSide() {
  return null;
}