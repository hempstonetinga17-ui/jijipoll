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

    const user = await prisma.user.findUnique({
      where: { id: agentId },
      select: { points: true, status: true, averageGrade: true }
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [submissionsToday, allSubmissions] = await Promise.all([
      prisma.dataSubmission.count({
        where: { agentId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.dataSubmission.findMany({
        where: { agentId },
        select: { status: true }
      })
    ]);

    const total = allSubmissions.length;
    const pending = allSubmissions.filter(s => s.status === "PENDING").length;
    const approved = allSubmissions.filter(s => s.status === "VERIFIED").length;
    const rejected = allSubmissions.filter(s => s.status === "REJECTED").length;
    const decided = approved + rejected;
    
    let approvalRate = 0;
    if (decided > 0) {
      approvalRate = Math.round((approved / decided) * 100);
    }

    const averageGrade = user?.averageGrade || 0;

    let grade = "N/A";
    if (decided >= 3) {
      if (averageGrade >= 90) grade = "A";
      else if (averageGrade >= 80) grade = "B";
      else if (averageGrade >= 70) grade = "C";
      else grade = "D";
    }

    return NextResponse.json({
      points: user?.points || 0,
      status: user?.status || "PENDING",
      submissionsToday,
      total,
      pending,
      approved,
      rejected,
      decided,
      approvalRate,
      averageGrade,
      grade
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
