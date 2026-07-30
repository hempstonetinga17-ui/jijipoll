import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function computeGrade(approved: number, rejected: number) {
  const total = approved + rejected;
  if (total === 0) return { grade: "N/A", rate: null, color: "gray" };
  const rate = Math.round((approved / total) * 100);
  if (rate >= 90) return { grade: "A", rate, color: "green" };
  if (rate >= 80) return { grade: "B", rate, color: "blue" };
  if (rate >= 70) return { grade: "C", rate, color: "yellow" };
  return { grade: "D", rate, color: "red" };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const agents = await prisma.user.findMany({
      where: { role: { in: ["AGENT", "SUPERVISOR"] } },
      orderBy: { createdAt: "desc" },
      include: {
        submissions: {
          select: { status: true, createdAt: true, latitude: true, longitude: true, category: true },
        },
      },
    });

    const agentsWithStats = agents.map((agent) => {
      const total = agent.submissions.length;
      const approved = agent.submissions.filter((s) => s.status === "VERIFIED").length;
      const rejected = agent.submissions.filter((s) => s.status === "REJECTED").length;
      const pending = agent.submissions.filter((s) => s.status === "PENDING").length;
      const { grade, rate, color } = computeGrade(approved, rejected);

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phoneNumber: agent.phoneNumber,
        role: agent.role,
        status: agent.status,
        points: agent.points,
        createdAt: agent.createdAt,
        stats: { total, approved, rejected, pending, grade, rate, color },
      };
    });

    return NextResponse.json({ agents: agentsWithStats });
  } catch (error: any) {
    console.error("Error fetching agents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
