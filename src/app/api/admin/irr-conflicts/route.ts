import { NextRequest, NextResponse } from "next/server"
import { auth, prisma } from "@/lib/auth"

const ADMIN_ROLES = ["ADMIN", "SUPERVISOR"]

// GET /api/admin/irr-conflicts — list all submissions in IRR conflict (ESCALATED + irrConflict)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const conflicts = await prisma.dataSubmission.findMany({
    where: { irrConflict: true, status: "ESCALATED" },
    include: {
      agent: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ conflicts, total: conflicts.length })
}
