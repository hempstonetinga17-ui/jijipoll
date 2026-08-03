import { NextRequest, NextResponse } from "next/server"
import { auth, prisma } from "@/lib/auth"

const ADMIN_ROLES = ["ADMIN", "SUPERVISOR"]

// GET /api/admin/reviewer-analytics
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Fetch all reviewers
  const reviewers = await prisma.user.findMany({
    where: { role: { in: ["REVIEWER", "SUPERVISOR", "ADMIN"] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isCalibrated: true,
      calibrationScore: true,
      calibrationReviewCount: true,
    },
  })

  // We need annotation data to compute metrics (like avg review time, avg grade)
  const annotations = await prisma.annotation.findMany({
    where: { reviewerGrade: { not: null } },
    select: {
      annotatorId: true,
      reviewerGrade: true,
      reviewDurationSecs: true,
    }
  })

  // Map annotations by annotatorId
  const annByAnnotator = annotations.reduce((acc: any, ann) => {
    if (!acc[ann.annotatorId]) acc[ann.annotatorId] = []
    acc[ann.annotatorId].push(ann)
    return acc
  }, {})

  // Compute platform averages for baseline
  const allGrades = annotations.map(a => a.reviewerGrade as number)
  const platformAvgGrade = allGrades.length > 0 ? allGrades.reduce((a, b) => a + b, 0) / allGrades.length : 0
  
  const allDurations = annotations.filter(a => a.reviewDurationSecs != null).map(a => a.reviewDurationSecs as number)
  const platformAvgDuration = allDurations.length > 0 ? allDurations.reduce((a, b) => a + b, 0) / allDurations.length : 0

  const analytics = reviewers.map(reviewer => {
    const revAnns = annByAnnotator[reviewer.id] || []
    
    const grades = revAnns.map((a: any) => a.reviewerGrade as number)
    const avgGrade = grades.length > 0 ? grades.reduce((a: any, b: any) => a + b, 0) / grades.length : 0
    
    const durations = revAnns.filter((a: any) => a.reviewDurationSecs != null).map((a: any) => a.reviewDurationSecs as number)
    const avgDuration = durations.length > 0 ? durations.reduce((a: any, b: any) => a + b, 0) / durations.length : 0

    // Grade bias = their avg - platform avg
    const gradeBias = grades.length > 0 ? avgGrade - platformAvgGrade : 0

    // Detect outliers (very basic)
    const isOutlier = grades.length >= 10 && Math.abs(gradeBias) > 15
    const isTooFast = durations.length >= 10 && avgDuration < (platformAvgDuration * 0.3) // e.g. < 30% of average time

    return {
      ...reviewer,
      totalReviews: revAnns.length,
      averageGrade: Math.round(avgGrade * 10) / 10,
      averageDurationSecs: Math.round(avgDuration),
      gradeBias: Math.round(gradeBias * 10) / 10,
      flags: {
        outlier: isOutlier,
        tooFast: isTooFast,
        uncalibrated: reviewer.calibrationReviewCount >= 10 && !reviewer.isCalibrated,
      }
    }
  })

  return NextResponse.json({ 
    platformMetrics: {
      averageGrade: Math.round(platformAvgGrade * 10) / 10,
      averageDurationSecs: Math.round(platformAvgDuration)
    },
    reviewers: analytics 
  })
}
