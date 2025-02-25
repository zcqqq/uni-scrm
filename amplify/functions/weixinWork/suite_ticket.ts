import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource'

export default async function suite_ticket(data: any) {
    //process suite_ticket message
    const SuiteId = data.SuiteId[0];
    const SuiteTicket = data.SuiteTicket[0];
    const TimeStamp = data.TimeStamp[0];
    console.log({ SuiteId, SuiteTicket, TimeStamp });

    //update database
    const client = generateClient<Schema>();
    const { data: globals, errors } = await client.models.Global.list({
        filter: { key: { eq: SuiteId } }
    });
    if (globals.length === 0) {
        const { errors, data: newGlobal } = await client.models.Global.create({
            key: SuiteId,
            value: SuiteTicket,
            timestamp: TimeStamp,
        })
    } else {
        const global = {
            id: globals[0].id,
            key: SuiteId,
            value: SuiteTicket,
            timestamp: TimeStamp,
          };
          const { data: updateGlobal, errors } = await client.models.Global.update(global);
    }

    return {
        statusCode: 200,
        body: 'success'
    };
}