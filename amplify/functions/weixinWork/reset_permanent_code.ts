import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../data/resource'

export default async function reset_permanent_code(data: any) {
    return {
        statusCode: 200,
        body: 'success'
    };
}