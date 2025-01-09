import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../amplify/data/resource'
import { fetchAuthSession } from 'aws-amplify/auth';

export const uploadFileToS3 = async (file: File) => {

const session = await fetchAuthSession();
const identityId = session.identityId;
    const client = generateClient<Schema>();
    if (!file) return;
    
    try {
        const result = await uploadData({
            path: `public/${identityId}/${file.name}`,
            data: file,
        });

        //create Content in database
        const content = {
            content_type: 'image',
            content_content: file.name,
        };
        const { data: createdContent, errors } = await client.models.Content.create(content, { authMode: 'userPool'});
        console.log('createdContent:', createdContent);

        return result;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};