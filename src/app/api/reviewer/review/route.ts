import { auth, prisma } from "@/lib/auth"
import { NextResponse } from "next/server"
import { reviewerActionSchema } from "@/lib/validate"

const REVIEWER_ROLES = ["REVIEWER", "SUPERVISOR", "ADMIN"]
const GOLDEN_CALIBRATION_THRESHOLD = 80 // min calibration % to keep reviewing
const GOLDEN_INJECT_EVERY = 50 // inject 1 golden item every N reviews

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
  const reviewerId = session.user.id

  // Load submission
  const submission = await prisma.dataSubmission.findUnique({
    where: { id: submissionId },
    include: { task: { select: { requireIRR: true, qualityThreshold: true } } },
  })

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 })
  }
  if (submission.agentId === reviewerId) {
    return NextResponse.json({ error: "Cannot review your own submission" }, { status: 403 })
  }
  if (!["PENDING", "SCREENED"].includes(submission.status)) {
    return NextResponse.json({ error: "Submission is not in a reviewable state" }, { status: 409 })
  }

  // ── GOLDEN SET CHECK ──────────────────────────────────────────
  if (submission.isGoldenSet && submission.goldenGrade !== null) {
    const goldenGrade = submission.goldenGrade
    const delta = Math.abs(grade - goldenGrade)
    const passed = delta <= 10

    // Record the calibration result
    await prisma.goldenSetResult.create({
      data: {
        reviewerId,
        submissionId,
        submissionType: "PHOTO",
        reviewerScore: grade,
        goldenGrade,
        delta,
        passed,
      },
    })

    // Recompute calibration score from last 20 golden results
    const recentResults = await prisma.goldenSetResult.findMany({
      where: { reviewerId },
      orderBy: { injectedAt: "desc" },
      take: 20,
    })
    const passedCount = recentResults.filter(r => r.passed).length
    const newCalibrationScore = recentResults.length > 0 ? (passedCount / recentResults.length) * 100 : 100
    const newCount = (await prisma.user.findUnique({ where: { id: reviewerId }, select: { calibrationReviewCount: true } }))?.calibrationReviewCount ?? 0

    const isNowCalibrated = newCount + 1 >= 10 && newCalibrationScore >= GOLDEN_CALIBRATION_THRESHOLD

    // Auto-suspend if calibration drops below threshold (after initial 10)
    const shouldSuspend = newCount + 1 >= 10 && newCalibrationScore < GOLDEN_CALIBRATION_THRESHOLD

    await prisma.user.update({
      where: { id: reviewerId },
      data: {
        calibrationScore: newCalibrationScore,
        calibrationReviewCount: { increment: 1 },
        isCalibrated: isNowCalibrated,
        ...(shouldSuspend ? { status: "SUSPENDED" } : {}),
      },
    })

    if (shouldSuspend) {
      return NextResponse.json({
        success: true,
        isGolden: true,
        passed,
        delta,
        goldenGrade,
        warning: "Your calibration score has dropped below 80%. Your account has been flagged for re-training.",
      })
    }

    return NextResponse.json({ success: true, isGolden: true, passed, delta, goldenGrade })
  }

  // ── IRR LOGIC ─────────────────────────────────────────────────
  const requireIRR = submission.task?.requireIRR ?? false

  if (requireIRR) {
    // Add annotation record for this reviewer's grade
    await prisma.annotation.create({
      data: {
        annotatorId: reviewerId,
        audioSubmissionId: null,
        textSubmissionId: null,
        videoSubmissionId: null,
        grade,
        reviewerGrade: grade,
        approved: action === "APPROVE",
        notes: feedback || null,
        reviewDurationSecs: body.reviewDurationSecs ?? null,
      },
    })

    const newReviewCount = (submission.reviewCount ?? 0) + 1

    if (newReviewCount >= 2) {
      // Fetch all annotation grades for this submission
      const annotations = await prisma.annotation.findMany({
        where: { reviewerGrade: { not: null } },
        select: { reviewerGrade: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      })

      const grades = annotations.map(a => a.reviewerGrade as number)
      const maxGrade = Math.max(...grades)
      const minGrade = Math.min(...grades)
      const avgGrade = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
      const disagreement = maxGrade - minGrade

      if (disagreement > 10) {
        // IRR conflict — escalate to QA
        await prisma.dataSubmission.update({
          where: { id: submissionId },
          data: {
            reviewCount: newReviewCount,
            irrConflict: true,
            status: "ESCALATED",
            reviewerId,
            reviewerGrade: avgGrade,
            reviewedAt: new Date(),
          },
        })
        return NextResponse.json({ success: true, irrConflict: true, disagreement, grades })
      } else {
        // IRR passed — use average
        const newStatus = avgGrade >= (submission.task?.qualityThreshold ?? 70) ? "REVIEWER_APPROVED" : "REVIEWER_REJECTED"
        await prisma.dataSubmission.update({
          where: { id: submissionId },
          data: {
            reviewCount: newReviewCount,
            irrConflict: false,
            irrAverageGrade: avgGrade,
            reviewerId,
            reviewerGrade: avgGrade,
            reviewerFeedback: feedback || null,
            reviewedAt: new Date(),
            status: newStatus,
          },
        })
        return NextResponse.json({ success: true, irrPassed: true, averageGrade: avgGrade, status: newStatus })
      }
    } else {
      // First reviewer — record and wait for second
      await prisma.dataSubmission.update({
        where: { id: submissionId },
        data: { reviewCount: newReviewCount },
      })
      return NextResponse.json({ success: true, waitingForSecondReviewer: true, reviewCount: newReviewCount })
    }
  }

  // ── STANDARD SINGLE-REVIEWER FLOW ────────────────────────────
  const newStatus = action === "APPROVE" ? "REVIEWER_APPROVED" : "REVIEWER_REJECTED"

  const updated = await prisma.dataSubmission.update({
    where: { id: submissionId },
    data: {
      reviewerId,
      reviewerGrade: grade,
      reviewerFeedback: feedback || null,
      reviewedAt: new Date(),
      reviewCount: { increment: 1 },
      status: newStatus,
    },
  })

  return NextResponse.json({ success: true, status: updated.status })
}
