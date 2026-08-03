import { auth, prisma } from "@/lib/auth"
import { NextResponse } from "next/server"
import { qaActionSchema } from "@/lib/validate"

const QA_ROLES = ["SUPERVISOR", "ADMIN"]
const QUALITY_THRESHOLD = 70

async function applyAutoGrade(agentId: string) {
  const decisions = await prisma.dataSubmission.findMany({
    where: {
      agentId,
      status: { in: ["VERIFIED", "REJECTED"] },
      qaGrade: { not: null }
    },
    select: { qaGrade: true }
  })

  if (decisions.length === 0) return

  const avg = decisions.reduce((sum, d) => sum + (d.qaGrade ?? 0), 0) / decisions.length

  await prisma.user.update({
    where: { id: agentId },
    data: { averageGrade: avg }
  })

  const agent = await prisma.user.findUnique({ where: { id: agentId }, select: { status: true } })
  if (!agent) return

  if (agent.status === "TRAINING" && decisions.length >= 50) {
    await prisma.user.update({
      where: { id: agentId },
      data: { status: avg >= QUALITY_THRESHOLD ? "ACTIVE" : "SUSPENDED" }
    })
  } else if (agent.status !== "TRAINING" && decisions.length >= 3) {
    if (avg < QUALITY_THRESHOLD) {
      await prisma.user.update({ where: { id: agentId }, data: { status: "SUSPENDED" } })
    } else if (avg < 80) {
      await prisma.user.update({ where: { id: agentId }, data: { status: "FLAGGED" } })
    } else if (["FLAGGED", "SUSPENDED"].includes(agent.status)) {
      await prisma.user.update({ where: { id: agentId }, data: { status: "ACTIVE" } })
    }
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !QA_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized — only QA Supervisors can certify submissions" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = qaActionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { submissionId, action, grade, feedback, overrideReason } = parsed.data

  const submission = await prisma.dataSubmission.findUnique({
    where: { id: submissionId },
  })

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 })
  }

  const allowedStatuses = ["REVIEWER_APPROVED", "REVIEWER_REJECTED", "ESCALATED", "PENDING", "SCREENED"]
  if (!allowedStatuses.includes(submission.status)) {
    return NextResponse.json({ error: `Cannot certify submission with status: ${submission.status}` }, { status: 409 })
  }

  // Check if QA is overriding reviewer
  const isOverride = submission.reviewerId !== null && (
    (action === "CERTIFY" && submission.status === "REVIEWER_REJECTED") ||
    (action === "REJECT" && submission.status === "REVIEWER_APPROVED")
  )

  if (isOverride && !overrideReason) {
    return NextResponse.json({ error: "Override reason is required when overriding a reviewer decision" }, { status: 400 })
  }

  let finalStatus: string
  let pointsDelta = 0

  if (action === "CERTIFY") {
    if (grade < QUALITY_THRESHOLD) {
      return NextResponse.json({ 
        error: `Grade ${grade} is below the quality threshold of ${QUALITY_THRESHOLD}. Use REJECT instead.` 
      }, { status: 400 })
    }
    finalStatus = "VERIFIED"
    pointsDelta = 10
  } else if (action === "REJECT") {
    finalStatus = "REJECTED"
  } else {
    finalStatus = "ESCALATED"
  }

  // Transaction: update submission + optionally award agent points
  await prisma.$transaction(async (tx) => {
    await tx.dataSubmission.update({
      where: { id: submissionId },
      data: {
        status: finalStatus,
        qaId: session.user.id,
        qaGrade: grade,
        qaFeedback: feedback || null,
        certifiedAt: new Date(),
        qaOverrideReason: isOverride ? (overrideReason || null) : null,
        // Also set the legacy grade/feedback fields for backward compat
        grade: grade,
        feedback: feedback || null,
      }
    })

    if (pointsDelta > 0) {
      await tx.user.update({
        where: { id: submission.agentId },
        data: { points: { increment: pointsDelta } }
      })
    }
  })

  await applyAutoGrade(submission.agentId)

  return NextResponse.json({ success: true, status: finalStatus, pointsAwarded: pointsDelta })
}
