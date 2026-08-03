import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/auth"

// GET /api/datasets/[datasetId] — public dataset detail
export async function GET(req: NextRequest, { params }: { params: { datasetId: string } }) {
  const dataset = await prisma.dataset.findUnique({
    where: { id: params.datasetId },
    select: {
      id: true, name: true, description: true, version: true,
      dataType: true, format: true, languages: true, itemCount: true,
      totalDurationSecs: true, averageGrade: true, qualityTier: true,
      license: true, priceUsd: true, sampleUrl: true, datasetCard: true,
      status: true, compiledAt: true,
    },
  })

  if (!dataset || dataset.status !== "AVAILABLE") {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
  }

  return NextResponse.json({ dataset })
}
