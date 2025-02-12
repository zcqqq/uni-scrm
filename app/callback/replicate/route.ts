import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { cookiesClient } from "@/utils/amplify-utils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log(body);
    
  const { data: contents } = await cookiesClient.models.Content.listContentByGeneration_id({
    generation_id: body.id,
  });
  const updateContent ={
    id: contents[0].id,
    generation_status: body.status,
    content_files: body.output,
  }
  const { data: updatedContent } = await cookiesClient.models.Content.update(updateContent);

  const s3Client = new S3Client({region: 'ap-east-1', maxAttempts: 3});
  const filenames = [];
  for (const fileUrl of body.output) {
    const url = fileUrl.toString();
    if (!url) throw new Error('No file URL returned from Replicate');
    const filename = Math.random().toString(36).substring(2, 15);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
        const fileBuffer = Buffer.from(await response.arrayBuffer());
        let s3Key;
        let s3ContentType;
        if (contents[0].content_type === 'IMAGE') {
            s3Key = `image/${contents[0].folder_id}/${filename}.webp`;
            s3ContentType = "image/webp";
        } else if (contents[0].content_type === 'VIDEO') {
            s3Key = `video/${contents[0].folder_id}/${filename}.mp4`;
            s3ContentType = "video/mp4";
        }
        // Upload the file
        await s3Client.send(new PutObjectCommand({
            Bucket: 'file.uni-scrm.com',
            Key: s3Key,
            Body: fileBuffer,
            ContentType: s3ContentType,
            Metadata: {
                content_id: body.content_id
            },
        }));

        filenames.push(filename);
    } catch (error) {
        console.log('upload file error: ' + error);
    } finally {
        s3Client.destroy();
    }
  }

  // Update content with all filenames after processing all files
  await cookiesClient.models.Content.update({
    id: contents[0].id,
    content_files: filenames
  });

  return NextResponse.json({ status: 200 });
}