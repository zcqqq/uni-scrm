import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,CreateGroupCommand, GetGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

// add user to group
export const handler: PostConfirmationTriggerHandler = async (event) => {
  try {
    // Try to create the group first - if it exists, this will fail
    const createCommand = new CreateGroupCommand({
      GroupName: event.request.userAttributes.nickname,
      UserPoolId: event.userPoolId
    });
    await client.send(createCommand);
  } catch (error: any) {
    // Ignore error if group already exists
    if (error.$metadata?.httpStatusCode !== 400) {
      throw error; // Re-throw if it's not a "group exists" error
    }
  }

  // Add user to group (will work whether we just created the group or it already existed)
  const addUserCommand = new AdminAddUserToGroupCommand({
    GroupName: event.request.userAttributes.nickname,
    Username: event.userName,
    UserPoolId: event.userPoolId
  });
  const response = await client.send(addUserCommand);
  console.log('processed', response.$metadata.requestId);
  return event;
};