import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { weixinWork, tiktok } from "../functions/resource";
import { postConfirmation } from "../auth/post-confirmation/resource";


/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  //core
  Global: a.model({
    key: a.string(), //企业微信suite_ticket
    value: a.string(),
    timestamp: a.integer(),
  }),
  Tenant: a.model({
    is_deleted: a.boolean().default(false),
    tenant_name: a.string(),
    corpid: a.string(),
    quota_video_generation: a.integer(),
    left_video_generation: a.integer(),
  }),
  User: a.model({
    is_deleted: a.boolean().default(false),
    owner: a.string(),
    group: a.string(),
    tenant_id: a.string(),
    email: a.string(),
  }).authorization(allow => [allow.ownerDefinedIn("owner"), allow.groupDefinedIn('group')]),
  Channel: a.model({
    is_deleted: a.boolean().default(false),
    owner: a.string(),
    group: a.string(),
    tenant_id: a.string(),
    channel_type: a.string(),
    channel_id: a.string(), //来自渠道的原始id
    channel_secret: a.string(),
    channel_name: a.string(),
    channel_status: a.string(),
    scope: a.string().array(),
    access_token: a.string(),
    expires_in: a.integer(),
    refresh_expires_in: a.integer(),
    refresh_token: a.string(),
    client_token: a.string(),
    client_expires_in: a.integer(),
  }),
  Content: a.model({
    tenant_id: a.string(),
    content_type: a.string(),
    content_content: a.string(), //TODO 先模拟content的文本内容
  }),
  Strategy: a.model({
    tenant_id: a.string(),
    strategy_name: a.string(),
    strategy_type: a.string(),
    triggerOption: a.string(),
    triggerContent: a.string(),
    actionOption: a.string(),
    actionContent: a.string()
  }),
  Audience: a.model({
    tenant_id: a.string(),
    audience_name: a.string(),
    audience_type: a.string(),
  }),
  Customer: a.model({
    tenant_id: a.string(),
    nickname: a.string(),
    gender: a.string(),
    //身份
    douyin_open_id: a.string(),
    douyin_union_id: a.string(),
    //自定义字段
    field1: a.string(),
  }),
  Group: a.model({
    tenant_id: a.string(),
    group_name: a.string(),
    group_type: a.string(),
  }),
  Tag: a.model({
    tenant_id: a.string(),
    tag_name: a.string(),
    tag_type: a.string(),
    parent_folder_id: a.id(),
  }),
  TagFolder: a.model({
    tenant_id: a.string(),
    folder_name: a.string(),
    parent_folder_id: a.id(),
  }),
  Event: a.model({
    tenant_id: a.string(),
    event_type: a.string(),
    event_timestamp: a.integer(),
  }),
  //meta
  MetaCustomerField: a.model({
    tenant_id: a.string(),
    field_id: a.string(),
    field_name: a.string(),
    field_type: a.string(),
  }),
}).authorization(allow => [allow.publicApiKey(),
allow.resource(tiktok), allow.resource(weixinWork), allow.resource(postConfirmation)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
