import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource'

export default async function change_auth(data: any) {
// Process change_auth message
const SuiteId = data.SuiteId[0];
const TimeStamp = data.TimeStamp[0];
const AuthCorpId = data.AuthCorpId?.[0];
const State = data.State?.[0];
const ExtraInfo = data.ExtraInfo?.[0];
console.log({ SuiteId, TimeStamp, AuthCorpId,State,ExtraInfo });

    return {
        statusCode: 200,
        body: 'success'
    };
}