import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'myStorage',
  isDefault: true,
  access: (allow) => ({
    'image/{entity_id}/*': [
      allow.guest.to(['read']),
      allow.entity('identity').to(['read', 'write', 'delete'])
    ],
    'video/{entity_id}/*': [
      allow.guest.to(['read']),
      allow.entity('identity').to(['read', 'write', 'delete'])
    ],
    'imagePrompt/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete'])
    ]
  })
});