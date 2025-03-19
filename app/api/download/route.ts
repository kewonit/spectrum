import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Get URL and filename from query parameters
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    let filename = searchParams.get("filename") || "certificate.png";
    
    // Validate the URL parameter
    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    // Security check: Only allow downloads from trusted domains
    const trustedDomains = [
      "edbn-images.fra1.digitaloceanspaces.com",
      "edbn-images.fra1.cdn.digitaloceanspaces.com",
      "res.cloudinary.com" // Add Cloudinary as a trusted domain
    ];
    
    const urlObj = new URL(url);
    if (!trustedDomains.includes(urlObj.hostname)) {
      return NextResponse.json({ 
        error: "Downloads only allowed from trusted domains" 
      }, { status: 403 });
    }

    // Authentication check (optional)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch the file using node-fetch (built into Next.js)
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch file: ${response.status} ${response.statusText}`
      }, { status: 502 });
    }
    
    // Get the file as an array buffer
    const fileBuffer = await response.arrayBuffer();

    // Create a response with the file data
    const nextResponse = new NextResponse(fileBuffer);
    
    // Set appropriate headers for downloading
    nextResponse.headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
    nextResponse.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    nextResponse.headers.set("Content-Length", response.headers.get("Content-Length") || String(fileBuffer.byteLength));
    
    return nextResponse;
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  }
}
