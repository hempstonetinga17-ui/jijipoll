import { auth, prisma } from "@/lib/auth"
import { NextResponse } from "next/server"

const REVIEWER_ROLES = ["REVIEWER", "SUPERVISOR", "ADMIN"]

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !REVIEWER_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)

  // Reviewers see SCREENED or PENDING submissions (not their own)
  const submissions = await prisma.dataSubmission.findMany({
    where: {
      status: { in: ["PENDING", "SCREENED"] },
      agentId: { not: session.user.id }, // Cannot review own submissions
      reviewerId: null, // Not yet assigned
    },
    include: {
      agent: {
        select: {
          id: true, name: true, email: true, phoneNumber: true,
          averageGrade: true, status: true,
          _count: { select: { submissions: { where: { status: "VERIFIED" } } } }
        }
      }
    },
    orderBy: { createdAt: "asc" }, // Oldest first (FIFO queue)
    take: limit,
  })

  return NextResponse.json(submissions)
}
