import { S3Client } from '@aws-sdk/client-s3';

export const spacesClient = new S3Client({
  endpoint: `https://${process.env.NEXT_PUBLIC_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.NEXT_PUBLIC_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!
  },
  forcePathStyle: false
});

// Use public bucket name variable for client-side access
export const SPACE_NAME = process.env.NEXT_PUBLIC_SPACE_NAME!;
export const SPACE_ENDPOINT = `https://${SPACE_NAME}.${process.env.NEXT_PUBLIC_SPACES_REGION}.cdn.digitaloceanspaces.com`;