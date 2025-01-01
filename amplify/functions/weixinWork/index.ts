import type { Handler } from 'aws-lambda';
import { getSignature, decrypt } from '@wecom/crypto';
import { parseStringPromise } from 'xml2js';
import suite_ticket from './suite_ticket';
import create_auth from './create_auth';
import change_auth from './change_auth';
import cancel_auth from './cancel_auth';
import reset_permanent_code from './reset_permanent_code';
//import { Amplify } from 'aws-amplify';
//import outputs from '../../../amplify_outputs.json';

//Amplify.configure(outputs);
export const handler: Handler = async (event) => {
  const Token = 'xyT411BTEZ4';
  const EncodingAESKey = 'wMyHVOyBFHEHaQrdWuicK29PbaLeynJHLIhI4HZatph';

  if (event.requestContext.http.method === 'GET') {
    console.log('Query parameters:', event.queryStringParameters);

    const timeStamp = event.queryStringParameters.timeStamp;
    const nonce = event.queryStringParameters.nonce;
    const echostr = event.queryStringParameters.echostr;

    const signature = getSignature(Token, timeStamp, nonce, echostr);
    console.log('Generated signature:', signature);

    const { message, id } = decrypt(EncodingAESKey, event.queryStringParameters.echostr);
    return {
      statusCode: 200,
      body: message
    };
  }

  if (event.body) {
    try {
      const xmlData = await parseStringPromise(event.body);
      console.log('Encrypted XML:', xmlData);

      // Decrypt the message first
      const { message } = decrypt(EncodingAESKey, xmlData.xml.Encrypt[0]);
      console.log('Decrypted message:', message);

      // Parse the decrypted XML message
      const decryptedXmlData = await parseStringPromise(message);
      console.log('Decrypted XML data:', decryptedXmlData);

      // Now we can process the decrypted message
      if (decryptedXmlData.xml.InfoType) {
        switch (decryptedXmlData.xml.InfoType[0]) {
          case 'suite_ticket':
            return suite_ticket(decryptedXmlData.xml);
          case 'create_auth':
            return create_auth(decryptedXmlData.xml);
          case 'change_auth':
            return change_auth(decryptedXmlData.xml);
          case 'cancel_auth':
            return cancel_auth(decryptedXmlData.xml);
          case 'reset_permanent_code':
            return reset_permanent_code(decryptedXmlData.xml);
        }
      }

    } catch (error) {
      console.error('Error processing message:', error);
      return { statusCode: 400, body: 'Error processing message' };
    }
  }

  return { statusCode: 400, body: 'Invalid request' };
};