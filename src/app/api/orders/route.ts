import { prisma } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()
  const { datasetId, buyerName, buyerEmail, buyerOrg, licenseType } = body

  if (!datasetId || !buyerName || !buyerEmail || !licenseType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const dataset = await prisma.dataset.findUnique({ where: { id: datasetId } })
  if (!dataset || dataset.status !== "AVAILABLE") {
    return NextResponse.json({ error: "Dataset not available" }, { status: 404 })
  }

  const priceMap: Record<string, number> = {
    RESEARCH: dataset.priceUsd * 0.5,
    COMMERCIAL: dataset.priceUsd,
    EXCLUSIVE: dataset.priceUsd * 8,
  }
  const amount = priceMap[licenseType] || dataset.priceUsd

  const order = await prisma.order.create({
    data: {
      datasetId,
      buyerName,
      buyerEmail,
      buyerOrg: buyerOrg || null,
      licenseType,
      amountUsd: amount,
      status: "PENDING",
    }
  })

  return NextResponse.json(order)
}

export async function GET(req: Request) {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  if (!session?.user?.id || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    include: { dataset: { select: { name: true, dataType: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}
