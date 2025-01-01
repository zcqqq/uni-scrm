import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { weixinWork } from './functions/resource';
import { tiktok } from './functions/resource';
import { storage } from './storage/resource';
defineBackend({
  auth,
  data,
  weixinWork,
  tiktok,
  storage
});
