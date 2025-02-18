import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: `https://${process.env.NEXT_PUBLIC_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.NEXT_PUBLIC_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!
  }
});

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    
    if (!key) {
      return NextResponse.json({ error: "No key provided" }, { status: 400 });
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.SPACE_NAME!,
        Key: key
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
