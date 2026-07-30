import { NextResponse } from "next/server";
import { getUploadUrl } from "@/lib/r2";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // We should ideally check if they are an AGENT, but we'll ensure they are logged in at least
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }

    const ext = filename.split(".").pop();
    const uniqueKey = `field-capture/${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const url = await getUploadUrl(uniqueKey, contentType);

    // Provide the public URL assuming R2 public bucket is configured
    // format is typically https://<public-url>/<key>
    const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";
    const publicUrl = `${publicDomain}/${uniqueKey}`;

    return NextResponse.json({ uploadUrl: url, key: uniqueKey, publicUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
