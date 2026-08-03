import { NextRequest, NextResponse } from "next/server"
import { auth, prisma } from "@/lib/auth"

// GET /api/admin/datasets — list all datasets (admin)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPERVISOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const datasets = await prisma.dataset.findMany({
    include: {
      orders: { select: { id: true, status: true, amountUsd: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ datasets })
}
