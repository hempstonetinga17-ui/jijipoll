import { prisma } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { datasetId: string } }
) {
  const dataset = await prisma.dataset.findUnique({
    where: { id: params.datasetId },
    include: { orders: { select: { id: true, licenseType: true, status: true, createdAt: true } } }
  })

  if (!dataset) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
  }

  return NextResponse.json(dataset)
}

export async function PATCH(
  req: Request,
  { params }: { params: { datasetId: string } }
) {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  if (!session?.user?.id || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, status, priceUsd, license, storageUrl, sampleUrl, datasetCard, qualityTier } = body

  const updated = await prisma.dataset.update({
    where: { id: params.datasetId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(priceUsd !== undefined ? { priceUsd } : {}),
      ...(license !== undefined ? { license } : {}),
      ...(storageUrl !== undefined ? { storageUrl } : {}),
      ...(sampleUrl !== undefined ? { sampleUrl } : {}),
      ...(datasetCard !== undefined ? { datasetCard } : {}),
      ...(qualityTier !== undefined ? { qualityTier } : {}),
      ...(status === "AVAILABLE" ? { compiledAt: new Date() } : {}),
    }
  })

  return NextResponse.json(updated)
}
