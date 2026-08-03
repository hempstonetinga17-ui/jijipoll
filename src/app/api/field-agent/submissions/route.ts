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

    // Fetch recent submissions from all categories
    const [photos, audios, texts, videos, evals] = await Promise.all([
      prisma.dataSubmission.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.audioSubmission.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.textSubmission.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.videoSubmission.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.evalSubmission.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // Format them into a unified structure
    const formattedPhotos = photos.map(p => ({
      id: p.id,
      type: "Photo Capture",
      category: p.category,
      info: `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`,
      status: p.status,
      grade: p.grade,
      feedback: p.feedback,
      createdAt: p.createdAt,
    }));

    const formattedAudios = audios.map(a => ({
      id: a.id,
      type: "Audio Recording",
      category: a.audioType,
      info: a.scriptPrompt || "Voice Recording",
      status: a.status,
      grade: a.grade,
      feedback: a.feedback,
      createdAt: a.createdAt,
    }));

    const formattedTexts = texts.map(t => ({
      id: t.id,
      type: "Text Entry",
      category: t.textType,
      info: t.submittedText,
      status: t.status,
      grade: t.grade,
      feedback: t.feedback,
      createdAt: t.createdAt,
    }));

    const formattedVideos = videos.map(v => ({
      id: v.id,
      type: "Video Vision",
      category: v.activityLabel || "Video",
      info: `${v.durationSecs || 0}s video`,
      status: v.status,
      grade: v.grade,
      feedback: v.feedback,
      createdAt: v.createdAt,
    }));

    const formattedEvals = evals.map(e => ({
      id: e.id,
      type: "AI Evaluation",
      category: e.domain || "RLHF",
      info: `Prompt: ${e.promptText.substring(0, 40)}... Rating: ${e.overallRating}/5`,
      status: e.status === "SUBMITTED" ? "VERIFIED" : e.status, // Evals are auto-rewarded/verified immediately
      grade: e.overallRating * 20, // Normalize 1-5 rating to 0-100% grade representation
      feedback: e.raterNotes,
      createdAt: e.createdAt,
    }));

    const unified = [
      ...formattedPhotos,
      ...formattedAudios,
      ...formattedTexts,
      ...formattedVideos,
      ...formattedEvals,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
     .slice(0, 50);

    return NextResponse.json({ submissions: unified });
  } catch (error) {
    console.error("Error fetching agent submissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
