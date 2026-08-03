import { NextRequest, NextResponse } from "next/server"
import { auth, prisma } from "@/lib/auth"

// GET /api/reviewer/calibration — return calibration status for logged-in reviewer
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isCalibrated: true,
      calibrationScore: true,
      calibrationReviewCount: true,
      status: true,
    },
  })

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const results = await prisma.goldenSetResult.findMany({
    where: { reviewerId: session.user.id },
    orderBy: { injectedAt: "desc" },
    take: 20,
  })

  const passCount = results.filter(r => r.passed).length
  const failCount = results.filter(r => !r.passed).length

  return NextResponse.json({
    isCalibrated: user.isCalibrated,
    calibrationScore: user.calibrationScore,
    calibrationReviewCount: user.calibrationReviewCount,
    needsInitialCalibration: user.calibrationReviewCount < 10,
    isSuspended: user.status === "SUSPENDED",
    recentResults: results,
    passCount,
    failCount,
  })
}
