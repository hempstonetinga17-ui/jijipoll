import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { submitSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let agentId = session.user.id;

    // Defensive check: verify the agentId exists in the DB
    // (Handles stale Google OAuth tokens that carry a non-DB id)
    const agentExists = await prisma.user.findUnique({ where: { id: agentId } });
    if (!agentExists) {
      // Try to find by email and use that user's real DB id
      const email = session.user.email;
      if (email) {
        const userByEmail = await prisma.user.findUnique({ where: { email } });
        if (userByEmail) {
          agentId = userByEmail.id;
        } else {
          // Create the user in DB so they can submit
          const newUser = await prisma.user.create({
            data: {
              email,
              name: session.user.name ?? null,
              image: session.user.image ?? null,
              role: "AGENT",
              status: "ACTIVE",
            }
          });
          agentId = newUser.id;
        }
      } else {
        return NextResponse.json({ error: "User not found. Please sign out and sign in again." }, { status: 401 });
      }
    }

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
    const result = submitSchema.safeParse(data);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { latitude, longitude, category, photoUrl, contactInfo, customFeatures } = result.data;

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
  } catch (error: any) {
    console.error("Error submitting field data:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
