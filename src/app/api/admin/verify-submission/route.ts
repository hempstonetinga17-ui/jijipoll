import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Recalculates agent grade and auto-enforces status based on approval rate. */
async function applyAutoGrade(agentId: string) {
  const submissions = await prisma.dataSubmission.findMany({
    where: { agentId, status: { in: ["VERIFIED", "REJECTED"] } },
    select: { status: true },
  });

  const approved = submissions.filter((s) => s.status === "VERIFIED").length;
  const rejected = submissions.filter((s) => s.status === "REJECTED").length;
  const total = approved + rejected;

  if (total < 3) return; // Not enough data to enforce yet

  const rate = (approved / total) * 100;

  let newStatus: string | null = null;
  if (rate < 70) {
    newStatus = "SUSPENDED"; // Grade D → auto-suspend
  } else if (rate < 80) {
    newStatus = "FLAGGED"; // Grade C → flag
  } else {
    // Rate ≥ 80 — lift FLAGGED/SUSPENDED if it was auto-imposed, restore ACTIVE
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: { status: true },
    });
    if (agent?.status === "FLAGGED" || agent?.status === "SUSPENDED") {
      newStatus = "ACTIVE";
    }
  }

  if (newStatus) {
    await prisma.user.update({
      where: { id: agentId },
      data: { status: newStatus },
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    const { submissionId, action } = await req.json(); // action = "APPROVE" or "REJECT"

    if (!submissionId || !action) {
      return NextResponse.json({ error: "Missing submissionId or action" }, { status: 400 });
    }

    const submission = await prisma.dataSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status !== "PENDING") {
      return NextResponse.json({ error: "Submission is already processed" }, { status: 400 });
    }

    let updatedSubmission;

    if (action === "APPROVE") {
      // Award 10 points to the agent and update status
      const [sub] = await prisma.$transaction([
        prisma.dataSubmission.update({
          where: { id: submissionId },
          data: { status: "VERIFIED" },
        }),
        prisma.user.update({
          where: { id: submission.agentId },
          data: { points: { increment: 10 } },
        }),
      ]);
      updatedSubmission = sub;
    } else if (action === "REJECT") {
      updatedSubmission = await prisma.dataSubmission.update({
        where: { id: submissionId },
        data: { status: "REJECTED" },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Auto-grade enforcement — runs after every decision
    await applyAutoGrade(submission.agentId);

    return NextResponse.json({ success: true, submission: updatedSubmission });
  } catch (error) {
    console.error("Error verifying submission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
