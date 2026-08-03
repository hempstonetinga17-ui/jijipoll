import { NextRequest, NextResponse } from "next/server"
import { auth, prisma } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { datasetId: string } }) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPERVISOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const dataset = await prisma.dataset.findUnique({
    where: { id: params.datasetId },
    include: {
      orders: {
        include: { accessLogs: { orderBy: { createdAt: "desc" }, take: 10 } },
      },
    },
  })

  if (!dataset) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ dataset })
}

export async function PATCH(req: NextRequest, { params }: { params: { datasetId: string } }) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPERVISOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { name, description, status, priceUsd, licenseType, datasetCard } = body

  const updated = await prisma.dataset.update({
    where: { id: params.datasetId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(priceUsd !== undefined ? { priceUsd: parseFloat(priceUsd) } : {}),
      ...(licenseType !== undefined ? { license: licenseType } : {}),
      ...(datasetCard !== undefined ? { datasetCard } : {}),
    },
  })

  return NextResponse.json({ success: true, dataset: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { datasetId: string } }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.dataset.update({
    where: { id: params.datasetId },
    data: { status: "ARCHIVED" },
  })

  return NextResponse.json({ success: true })
}
