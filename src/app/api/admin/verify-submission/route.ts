import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // We should ideally check if they are ADMIN
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

    if (action === "APPROVE") {
      // Award 10 points to the agent and update status
      const updatedSubmission = await prisma.$transaction([
        prisma.dataSubmission.update({
          where: { id: submissionId },
          data: { status: "VERIFIED" },
        }),
        prisma.user.update({
          where: { id: submission.agentId },
          data: { points: { increment: 10 } },
        }),
      ]);

      return NextResponse.json({ success: true, submission: updatedSubmission[0] });
    } else if (action === "REJECT") {
      const updatedSubmission = await prisma.dataSubmission.update({
        where: { id: submissionId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, submission: updatedSubmission });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error verifying submission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
