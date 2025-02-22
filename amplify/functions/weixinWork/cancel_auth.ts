
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../data/resource'

export default async function cancel_auth(data: any) {
  //process c_auth message
  const InfoType = data.InfoType[0];
  const SuiteId = data.SuiteId[0];
  const TimeStamp = data.TimeStamp[0];
  const AuthCorpId = data.AuthCorpId[0];
  console.log({ InfoType, SuiteId, TimeStamp, AuthCorpId });

  //logically delete database
  const client = generateClient<Schema>();
  const { data: channels, errors } = await client.models.Channel.list({
    filter: { channel_id: { eq: SuiteId } }, authMode: 'userPool'
  });
  if (channels.length > 0) {
    const channel = {
      id: channels[0].id,
      is_deleted: true,
    };
    const { data: updatedChannel, errors } = await client.models.Channel.update(channel, { authMode: 'userPool' });
  }

  return {
    statusCode: 200,
    body: 'success'
  };
}