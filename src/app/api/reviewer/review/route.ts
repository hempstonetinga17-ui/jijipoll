import { auth, prisma } from "@/lib/auth"
import { NextResponse } from "next/server"
import { reviewerActionSchema } from "@/lib/validate"

const REVIEWER_ROLES = ["REVIEWER", "SUPERVISOR", "ADMIN"]

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !REVIEWER_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = reviewerActionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { submissionId, action, grade, feedback } = parsed.data

  // Load submission
  const submission = await prisma.dataSubmission.findUnique({
    where: { id: submissionId },
  })

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 })
  }
  if (submission.agentId === session.user.id) {
    return NextResponse.json({ error: "Cannot review your own submission" }, { status: 403 })
  }
  if (![ "PENDING", "SCREENED"].includes(submission.status)) {
    return NextResponse.json({ error: "Submission is not in a reviewable state" }, { status: 409 })
  }

  // Determine threshold (default 70)
  const newStatus = action === "APPROVE" ? "REVIEWER_APPROVED" : "REVIEWER_REJECTED"

  const updated = await prisma.dataSubmission.update({
    where: { id: submissionId },
    data: {
      reviewerId: session.user.id,
      reviewerGrade: grade,
      reviewerFeedback: feedback || null,
      reviewedAt: new Date(),
      status: newStatus,
    },
  })

  return NextResponse.json({ success: true, status: updated.status })
}
