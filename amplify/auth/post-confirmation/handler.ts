import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
    CognitoIdentityProviderClient,
    AdminAddUserToGroupCommand, CreateGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { type Schema } from '../../data/resource'
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/post-confirmation";
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
    env
);
Amplify.configure(resourceConfig, libraryOptions);

const client = new CognitoIdentityProviderClient();
const dataClient = generateClient<Schema>();
export const handler: PostConfirmationTriggerHandler = async (event) => {
    //upsert Tenant in database
    const { data: tenants } = await dataClient.models.Tenant.list({
        filter: { tenant_name: { eq: event.request.userAttributes.nickname } }
    });
    let tenant_id;
    if (tenants.length > 0) {
        const tenant = {
            id: tenants[0].id,
            is_deleted: false,
        };
        const { data: updatedTenant, errors } = await dataClient.models.Tenant.update(tenant);
        console.log('updatedTenant: ' + updatedTenant);
        tenant_id = updatedTenant?.id;
    } else {
        const tenant = {
            is_deleted: false,
            tenant_name: event.request.userAttributes.nickname,
        };
        const { data: createdTenant, errors } = await dataClient.models.Tenant.create(tenant);
        console.log('createdTenant: ' + createdTenant);
        tenant_id = createdTenant?.id;
    }

    // create Cognito group name as tenant_id
    try {
        // Try to create the group first - if it exists, this will fail
        const createCommand = new CreateGroupCommand({
            GroupName: tenant_id,
            UserPoolId: event.userPoolId
        });
        await client.send(createCommand);
    } catch (error: any) {
        // Ignore error if group already exists
        if (error.$metadata?.httpStatusCode !== 400) {
            throw error; // Re-throw if it's not a "group exists" error
        }
    }

    // Add user to group
    const addUserCommand = new AdminAddUserToGroupCommand({
        GroupName: tenant_id,
        Username: event.userName,
        UserPoolId: event.userPoolId
    });
    const response = await client.send(addUserCommand);
    console.log('processed', response.$metadata.requestId);

    // upsert User in database
    const { data: users } = await dataClient.models.User.list({
        filter: { email: { eq: event.request.userAttributes.email } }
    });
    if (users.length > 0) {
        const user = {
            id: users[0].id,
            is_deleted: false,
        };
        const { data: updatedUser, errors } = await dataClient.models.User.update(user);
        console.log('updatedUser: ' + updatedUser);
    } else {
        const user = {
            is_deleted: false,
            email: event.request.userAttributes.email,
        };
        const { data: createdUser, errors } = await dataClient.models.User.create(user);
        console.log('createdUser: ' + createdUser);
    }

    return event;
};