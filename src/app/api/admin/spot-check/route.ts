import { auth, prisma } from "@/lib/auth"
import { NextResponse } from "next/server"
import { spotCheckSchema } from "@/lib/validate"

const ADMIN_ROLES = ["ADMIN", "PROJECT_MANAGER"]

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)

  // Get recently verified submissions not yet spot-checked, ordered randomly
  const submissions = await prisma.dataSubmission.findMany({
    where: {
      status: "VERIFIED",
      spotChecked: false,
    },
    include: {
      agent: { select: { id: true, name: true, email: true, averageGrade: true } },
      reviewer: { select: { id: true, name: true } },
      qaCertifier: { select: { id: true, name: true } },
    },
    orderBy: { certifiedAt: "desc" },
    take: limit,
  })

  return NextResponse.json(submissions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = spotCheckSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { submissionId, verdict, auditorNote } = parsed.data

  const submission = await prisma.dataSubmission.findUnique({
    where: { id: submissionId },
    select: { id: true, status: true, qaId: true }
  })

  if (!submission || submission.status !== "VERIFIED") {
    return NextResponse.json({ error: "Submission not found or not in VERIFIED state" }, { status: 404 })
  }

  await prisma.dataSubmission.update({
    where: { id: submissionId },
    data: {
      spotChecked: true,
      spotCheckVerdict: verdict,
      spotCheckedAt: new Date(),
      spotCheckedBy: session.user.id,
      // If flagged, escalate back for QA re-review
      status: verdict === "FLAGGED" ? "ESCALATED" : "VERIFIED",
    }
  })

  return NextResponse.json({ success: true, verdict })
}
