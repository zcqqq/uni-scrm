import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { weixinWork, tiktok,replicate } from "../functions/resource";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { myApiFunction } from "../functions/api-function/resource";

const schema = a.schema({
  //core
  Global: a.model({
    group: a.string(),
    key: a.string(), //企业微信suite_ticket
    value: a.string(),
    timestamp: a.integer(),
  }),
  Tenant: a.model({
    is_deleted: a.boolean().default(false),
    group: a.string(),
    tenant_name: a.string(),
    corpid: a.string(),
    quota_video_generation: a.integer(),
    left_video_generation: a.integer(),
  }),
  User: a.model({
    is_deleted: a.boolean().default(false),
    group: a.string(),
    email: a.string(),
  }),
  Channel: a.model({
    is_deleted: a.boolean().default(false),
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

    is_verified: a.boolean(),
    avatar_url: a.string(),
    bio_description: a.string(),
    likes_count: a.integer(),
    follower_count: a.integer(),
    following_count: a.integer(),
    contents: a.hasMany('ContentChannel', 'channel_id'),

    max_video_post_duration_sec: a.integer(), //TIKTOK
    privacy_level_options: a.string().array(), //TIKTOK
  }),
  Content: a.model({
    group: a.string(),
    tenant_id: a.string(),
    status_generate: a.string(),
    content_type: a.enum(['IMAGE','TEXT','VIDEO']),
    content_content: a.string(), //TODO 先模拟content的文本内容
    content_campaign: a.string(),
    content_model: a.string(),
    content_prompt: a.string(),
    content_quality: a.enum(['NORMAL','HIGH']),
    content_ratio: a.string(),
    content_width: a.integer(),
    content_height: a.integer(),
    channels: a.hasMany('ContentChannel', 'content_id'),
  }),
  ContentChannel: a.model({
    group: a.string(),
    content_id: a.id().required(),
    content_type: a.enum(['IMAGE','TEXT','VIDEO']),
    channel_id: a.id().required(),
    channel_type: a.string(),
    publish_id: a.string(),
    publish_status: a.string(),
    content: a.belongsTo('Content', 'content_id'),
    channel: a.belongsTo('Channel', 'channel_id'),
  }).secondaryIndexes((index) => [index('publish_id')]),
  Strategy: a.model({
    group: a.string(),
    strategy_name: a.string(),
    strategy_type: a.string(),
    triggerOption: a.string(),
    triggerContent: a.string(),
    actionOption: a.string(),
    actionContent: a.string()
  }),
  Audience: a.model({
    group: a.string(),
    audience_name: a.string(),
    audience_type: a.string(),
  }),
  Customer: a.model({
    group: a.string(),
    nickname: a.string(),
    gender: a.string(),
    //身份
    douyin_open_id: a.string(),
    douyin_union_id: a.string(),
    //自定义字段
    field1: a.string(),
  }),
  Group: a.model({
    group: a.string(),
    group_name: a.string(),
    group_type: a.string(),
  }),
  Tag: a.model({
    group: a.string(),
    tag_name: a.string(),
    tag_type: a.string(),
    parent_folder_id: a.id(),
  }),
  TagFolder: a.model({
    group: a.string(),
    folder_name: a.string(),
    parent_folder_id: a.id(),
  }),
  Event: a.model({
    group: a.string(),
    event_type: a.string(),
    event_timestamp: a.integer(),
  }),
  //meta
  MetaCustomerField: a.model({
    group: a.string(),
    field_id: a.string(),
    field_name: a.string(),
    field_type: a.string(),
  }),
}).authorization(allow => [allow.owner(),allow.groupDefinedIn('group'),allow.publicApiKey(),allow.resource(myApiFunction),allow.resource(replicate),
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