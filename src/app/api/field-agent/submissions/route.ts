import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = session.user.id;

    const submissions = await prisma.dataSubmission.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      take: 50, // Get last 50 for the dashboard
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching agent submissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
