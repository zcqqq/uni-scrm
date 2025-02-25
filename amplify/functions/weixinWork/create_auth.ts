/* 
https://developer.work.weixin.qq.com/document/path/97174#%E6%8E%88%E6%9D%83%E6%88%90%E5%8A%9F%E9%80%9A%E7%9F%A5
<xml>
  <SuiteId><![CDATA[ww4asffe9xxx4c0f4c]]></SuiteId>
  <AuthCode><![CDATA[AUTHCODE]]></AuthCode>
  <InfoType><![CDATA[create_auth]]></InfoType>
  <TimeStamp>1403610513</TimeStamp>
  <State><![CDATA[123]]></State>
  <ExtraInfo></ExtraInfo>
</xml> */
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource'
import get_suite_token from './yingyongshouquan/get_suite_token';
import get_permanent_code from './yingyongshouquan/get_permanent_code';

export default async function create_auth(data: any) {
  const client = generateClient<Schema>();

  //process create_auth message
  const SuiteId = data.SuiteId[0];
  const AuthCode = data.AuthCode[0];
  const TimeStamp = data.TimeStamp[0];
  const State = data.State?.[0];
  const ExtraInfo = data.ExtraInfo?.[0];
  console.log({ InfoType: 'create_auth', SuiteId, AuthCode, TimeStamp, State, ExtraInfo });

  //get suite_ticket from database
  const { data: suite_ticket } = await client.models.Global.list({
    filter: { key: { eq: SuiteId } }
  });
  if (!suite_ticket[0]?.value) {
    throw new Error('Suite ticket value is missing');
  }
  const suite_access_token = await get_suite_token(suite_ticket[0].value);
  console.log({ "suite_access_token": suite_access_token });

  await get_permanent_code(suite_access_token, AuthCode);

}