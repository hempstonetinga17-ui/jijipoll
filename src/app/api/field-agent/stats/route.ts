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

    // Fetch counts and submissions from all collections
    const [
      subTodayPhotos,
      subTodayAudios,
      subTodayTexts,
      subTodayVideos,
      subTodayEvals,
      photos,
      audios,
      texts,
      videos,
      evals
    ] = await Promise.all([
      // Daily Limits queries
      prisma.dataSubmission.count({
        where: { agentId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.audioSubmission.count({
        where: { agentId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.textSubmission.count({
        where: { agentId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.videoSubmission.count({
        where: { agentId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.evalSubmission.count({
        where: { agentId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      // Lifetime status aggregation queries
      prisma.dataSubmission.findMany({
        where: { agentId },
        select: { status: true, grade: true }
      }),
      prisma.audioSubmission.findMany({
        where: { agentId },
        select: { status: true, grade: true }
      }),
      prisma.textSubmission.findMany({
        where: { agentId },
        select: { status: true, grade: true }
      }),
      prisma.videoSubmission.findMany({
        where: { agentId },
        select: { status: true, grade: true }
      }),
      prisma.evalSubmission.findMany({
        where: { agentId },
        select: { status: true } // Eval submissions are auto-approved / don't have separate grade steps
      })
    ]);

    const submissionsToday = subTodayPhotos + subTodayAudios + subTodayTexts + subTodayVideos + subTodayEvals;

    // Helper functions for parsing standard status fields
    const getApprovedCount = (arr: { status: string }[], approvedVal = "VERIFIED") => arr.filter(s => s.status === approvedVal).length;
    const getRejectedCount = (arr: { status: string }[], rejectedVal = "REJECTED") => arr.filter(s => s.status === rejectedVal).length;

    const approvedPhotos = getApprovedCount(photos, "VERIFIED");
    const rejectedPhotos = getRejectedCount(photos, "REJECTED");

    const approvedAudios = getApprovedCount(audios, "APPROVED");
    const rejectedAudios = getRejectedCount(audios, "REJECTED");

    const approvedTexts = getApprovedCount(texts, "APPROVED");
    const rejectedTexts = getRejectedCount(texts, "REJECTED");

    const approvedVideos = getApprovedCount(videos, "APPROVED");
    const rejectedVideos = getRejectedCount(videos, "REJECTED");

    const approvedEvals = evals.length; // Eval submissions are auto-awarded/approved immediately

    const total = photos.length + audios.length + texts.length + videos.length + evals.length;
    const approved = approvedPhotos + approvedAudios + approvedTexts + approvedVideos + approvedEvals;
    const rejected = rejectedPhotos + rejectedAudios + rejectedTexts + rejectedVideos;
    const pending = total - (approved + rejected);
    const decided = approved + rejected;

    let approvalRate = 0;
    if (decided > 0) {
      approvalRate = Math.round((approved / decided) * 100);
    }

    // Dynamic quality grade calculation based on graded records
    const gradedSubmissions = [
      ...photos.filter(p => p.grade !== null),
      ...audios.filter(a => a.grade !== null),
      ...texts.filter(t => t.grade !== null),
      ...videos.filter(v => v.grade !== null)
    ];

    let averageGrade = user?.averageGrade || 0;
    if (gradedSubmissions.length > 0) {
      const sum = gradedSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
      averageGrade = Math.round(sum / gradedSubmissions.length);
    }

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
