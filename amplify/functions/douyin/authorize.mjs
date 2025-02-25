import { CognitoIdentityProviderClient, CreateGroupCommand, GetGroupCommand, AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { AppSyncClient } from "@aws-sdk/client-appsync";
import https from 'https';
import appsync from './appsync.mjs';


export default async function authorize(jsonBody) {
  try {
    let channel_id;
    const searchChannelResponse = await appsync({
      query: 'query MyQuery {listChannels(filter: {channel_status: {eq: "INACTIVE"}, channel_type: {eq: "DOUYIN"}}) {items {id}}}',
    });
    if (searchChannelResponse.data.listChannels.items.length > 0) {
      channel_id = searchChannelResponse.data.listChannels.items[0].id;
      console.log('update channel_id:' + channel_id);
      await appsync({
        query: 'mutation MyMutation {updateChannel(input: {id: "' + channel_id + '", channel_name: "", channel_status: "ACTIVE", channel_id: "' + jsonBody.from_user_id + '"}){id}}',
      });
    }
  } catch (error) {
    return {
      statusCode: 400, body: error.message,
    };
  }

  /*//1. 如果租户不存在，则在cognito中创建group，表中创建tenant和channel；否则返回租户信息.
  const cognitoClient = new CognitoIdentityProviderClient();
  let userPoolId = process.env.amplifyAuth_userPoolId;
  const tenant = jsonBody.from_user_id;
  const groupParams = {
    GroupName: tenant,
    UserPoolId: userPoolId,
  };
  try {
    const response = await cognitoClient.send(new GetGroupCommand(groupParams));
    console.log(response);
  } catch (e) {
    const response = await cognitoClient.send(new CreateGroupCommand(groupParams));
    console.log(response);
  }

const config = {
  apiUrl: "https://xqpptgyamjcyrjyfcnrf7jxkh4.appsync-api.us-east-1.amazonaws.com/graphql" // Change the GraphQL Endpoint to your environment, which you can find in the Amplify Params 
}
const client = new AppSyncClient(config)
const queryTenant = async (id) => { // Example function
  try {
    const result = await client.request({
      query: gql(getTenant), // use your graphql query here
      variables: {
        input: {
          id
        }
      }
    })
    return result.getTenant;
  } catch (error) {
    console.log("Something went wrong in the querySomething function:", error)
  }
}
  try {
    return await queryTenant("a489c285-cc82-4c83-9a39-fbbcb5482410"); // You can also use the arguments / input from the event.
  } catch (error) {
    console.log("Something went wrong in the handler:", error)
  }

  //2. 如果用户不存在，则在cognito中创建user；否则返回用户信息.

  //3. 将当前user加入group
  /*const addUserParams = {
    GroupName: tenant,
    UserPoolId: userPoolId,
    Username: tenant,
  };
  try {
    await client.send(new AdminAddUserToGroupCommand(addUserParams));
  } catch (e) {
    // Handle error if needed
  }*/
};