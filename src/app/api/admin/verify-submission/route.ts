import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { verifySubmissionSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";

/** Recalculates agent grade, auto-enforces status, and handles training phase. */
async function applyAutoGrade(agentId: string) {
  const submissions = await prisma.dataSubmission.findMany({
    where: { agentId, status: { in: ["VERIFIED", "REJECTED"] } },
    select: { status: true },
  });

  const approved = submissions.filter((s) => s.status === "VERIFIED").length;
  const rejected = submissions.filter((s) => s.status === "REJECTED").length;
  const total = approved + rejected;

  if (total === 0) return;

  const rate = (approved / total) * 100;

  const agent = await prisma.user.findUnique({
    where: { id: agentId },
    select: { status: true },
  });

  if (!agent) return;

  let newStatus: string | null = null;
  
  // Training logic: transition to ACTIVE after 50 submissions if they meet minimum 70% rate
  if (agent.status === "TRAINING" && total >= 50) {
    if (rate >= 70) {
       newStatus = "ACTIVE";
    } else {
       newStatus = "SUSPENDED"; // Failed training
    }
  } else if (agent.status !== "TRAINING" && total >= 3) {
    // Normal grading logic (ignore for trainees until they hit 50)
    if (rate < 70) {
      newStatus = "SUSPENDED"; // Grade D → auto-suspend
    } else if (rate < 80) {
      newStatus = "FLAGGED"; // Grade C → flag
    } else {
      // Rate ≥ 80 — lift FLAGGED/SUSPENDED if it was auto-imposed, restore ACTIVE
      if (agent.status === "FLAGGED" || agent.status === "SUSPENDED") {
        newStatus = "ACTIVE";
      }
    }
  }

  if (newStatus && newStatus !== agent.status) {
    await prisma.user.update({
      where: { id: agentId },
      data: { status: newStatus },
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERVISOR")) {
      return NextResponse.json({ error: "Forbidden: Not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = verifySubmissionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { submissionId, action, feedback } = result.data;

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
          data: { status: "VERIFIED", feedback },
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
        data: { status: "REJECTED", feedback },
      });
    }

    // Auto-grade enforcement — runs after every decision
    await applyAutoGrade(submission.agentId);

    return NextResponse.json({ success: true, submission: updatedSubmission });
  } catch (error) {
    console.error("Error verifying submission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
