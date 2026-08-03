import { NextRequest, NextResponse } from "next/server"
import { auth, prisma } from "@/lib/auth"

const ADMIN_ROLES = ["ADMIN", "SUPERVISOR"]

// GET /api/admin/golden-set — list all golden set items (DataSubmission only for now)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const goldenItems = await prisma.dataSubmission.findMany({
    where: { isGoldenSet: true },
    include: {
      agent: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true } },
      qaCertifier: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Also fetch audio golden items
  const audioGolden = await prisma.audioSubmission.findMany({
    where: { isGoldenSet: true },
    include: {
      agent: { select: { id: true, name: true, email: true } },
      language: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ photo: goldenItems, audio: audioGolden })
}

// POST /api/admin/golden-set — mark a VERIFIED submission as golden set
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { submissionId, submissionType, goldenGrade } = body

  if (!submissionId || !submissionType || goldenGrade === undefined) {
    return NextResponse.json({ error: "submissionId, submissionType, and goldenGrade are required" }, { status: 400 })
  }

  if (typeof goldenGrade !== "number" || goldenGrade < 0 || goldenGrade > 100) {
    return NextResponse.json({ error: "goldenGrade must be 0–100" }, { status: 400 })
  }

  let updated: any
  if (submissionType === "PHOTO") {
    const sub = await prisma.dataSubmission.findUnique({ where: { id: submissionId } })
    if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    if (sub.status !== "VERIFIED") return NextResponse.json({ error: "Only VERIFIED submissions can be made golden" }, { status: 400 })
    updated = await prisma.dataSubmission.update({
      where: { id: submissionId },
      data: { isGoldenSet: true, goldenGrade },
    })
  } else if (submissionType === "AUDIO") {
    const sub = await prisma.audioSubmission.findUnique({ where: { id: submissionId } })
    if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    updated = await prisma.audioSubmission.update({
      where: { id: submissionId },
      data: { isGoldenSet: true, goldenGrade },
    })
  } else {
    return NextResponse.json({ error: "submissionType must be PHOTO or AUDIO" }, { status: 400 })
  }

  return NextResponse.json({ success: true, updated })
}

// DELETE /api/admin/golden-set — remove a submission from golden set
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { submissionId, submissionType } = body

  if (submissionType === "PHOTO") {
    await prisma.dataSubmission.update({
      where: { id: submissionId },
      data: { isGoldenSet: false, goldenGrade: null },
    })
  } else if (submissionType === "AUDIO") {
    await prisma.audioSubmission.update({
      where: { id: submissionId },
      data: { isGoldenSet: false, goldenGrade: null },
    })
  }

  return NextResponse.json({ success: true })
}
