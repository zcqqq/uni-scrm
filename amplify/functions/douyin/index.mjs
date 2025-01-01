import verify_webhook from './verify_webhook.mjs';
import authorize from './authorize.mjs';
import im_group_receive_msg from './im_group_receive_msg.mjs';

export const handler = async (event) => {
  console.log('Received event:', event);
  if (event.body && event.body !== '') {
    const jsonBody = JSON.parse(event.body);
    switch (jsonBody.event) {
      case 'verify_webhook': return verify_webhook(jsonBody);
      case 'authorize': return authorize(jsonBody);
      case 'im_group_receive_msg': return im_group_receive_msg(jsonBody);
    }
  } else {
    const queryStringParameters = JSON.parse(event.queryStringParameters);
    return auth_code(queryStringParameters);
  }
}