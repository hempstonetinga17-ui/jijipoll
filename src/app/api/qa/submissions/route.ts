import { auth, prisma } from "@/lib/auth"
import { NextResponse } from "next/server"

const QA_ROLES = ["SUPERVISOR", "ADMIN"]

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !QA_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || "REVIEWER_APPROVED,REVIEWER_REJECTED"
  const statuses = status.split(",").filter(s => [
    "REVIEWER_APPROVED", "REVIEWER_REJECTED", "ESCALATED"
  ].includes(s))

  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

  const submissions = await prisma.dataSubmission.findMany({
    where: { status: { in: statuses } },
    include: {
      agent: {
        select: { id: true, name: true, email: true, phoneNumber: true, averageGrade: true }
      },
      reviewer: {
        select: { id: true, name: true, email: true, averageGrade: true }
      }
    },
    orderBy: { reviewedAt: "asc" },
    take: limit,
  })

  return NextResponse.json(submissions)
}
