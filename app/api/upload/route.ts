import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import path from 'path';

const s3Client = new S3Client({
  endpoint: `https://${process.env.NEXT_PUBLIC_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.NEXT_PUBLIC_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!
  }
});

const SPACE_NAME = process.env.SPACE_NAME!;
const SPACE_ENDPOINT = `https://${SPACE_NAME}.${process.env.NEXT_PUBLIC_SPACES_REGION}.cdn.digitaloceanspaces.com`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create unique file key with user ID and UUID
    const fileUuid = uuid();
    const fileExtension = path.extname(file.name);
    const key = `spectrum/payment-screenshots/${user.id}/${fileUuid}${fileExtension}`;

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: SPACE_NAME,
        Key: key,
        Body: uint8Array,
        ContentType: file.type,
        ACL: 'public-read',
        CacheControl: 'no-cache'
      })
    );

    const url = `${SPACE_ENDPOINT}/${key}`;
    return NextResponse.json({ url });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
