import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2";
import { auth } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

// Allow up to 10MB uploads
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB allowed." }, { status: 413 });
    }
    
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const key = `field-capture/${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || "",
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";
    const publicUrl = `${publicDomain}/${key}`;

    return NextResponse.json({ publicUrl, key });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
