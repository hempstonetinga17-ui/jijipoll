import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = session.user.id;

    // Optional: enforce role AGENT
    // if (session.user.role !== "AGENT") {
    //   return NextResponse.json({ error: "Forbidden: Not an agent" }, { status: 403 });
    // }

    // Check submission limit (15 per day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const submissionsToday = await prisma.dataSubmission.count({
      where: {
        agentId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (submissionsToday >= 15) {
      return NextResponse.json(
        { error: "Daily limit reached. You can only submit up to 15 items per day." },
        { status: 429 }
      );
    }

    const data = await req.json();
    const { latitude, longitude, category, photoUrl, contactInfo, customFeatures } = data;

    if (!latitude || !longitude || !category || !photoUrl || !contactInfo || !customFeatures) {
      return NextResponse.json(
        { error: "Missing required fields (latitude, longitude, category, photoUrl, contactInfo, customFeatures)" },
        { status: 400 }
      );
    }

    const submission = await prisma.dataSubmission.create({
      data: {
        agentId,
        latitude,
        longitude,
        category,
        photoUrl,
        contactInfo,
        customFeatures,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Error submitting field data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
