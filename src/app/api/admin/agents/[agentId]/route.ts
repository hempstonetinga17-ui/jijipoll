import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const agent = await prisma.user.findUnique({
      where: { id: params.agentId },
      include: {
        submissions: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            category: true,
            latitude: true,
            longitude: true,
            photoUrl: true,
            contactInfo: true,
            createdAt: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const total = agent.submissions.length;
    const approved = agent.submissions.filter((s) => s.status === "VERIFIED").length;
    const rejected = agent.submissions.filter((s) => s.status === "REJECTED").length;
    const pending = agent.submissions.filter((s) => s.status === "PENDING").length;

    const decidedTotal = approved + rejected;
    const rate = decidedTotal > 0 ? Math.round((approved / decidedTotal) * 100) : null;

    let grade = "N/A";
    let gradeColor = "gray";
    if (rate !== null) {
      if (rate >= 90) { grade = "A"; gradeColor = "green"; }
      else if (rate >= 80) { grade = "B"; gradeColor = "blue"; }
      else if (rate >= 70) { grade = "C"; gradeColor = "yellow"; }
      else { grade = "D"; gradeColor = "red"; }
    }

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phoneNumber: agent.phoneNumber,
        role: agent.role,
        status: agent.status,
        points: agent.points,
        createdAt: agent.createdAt,
      },
      stats: { total, approved, rejected, pending, rate, grade, gradeColor },
      submissions: agent.submissions,
    });
  } catch (error: any) {
    console.error("Error fetching agent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
