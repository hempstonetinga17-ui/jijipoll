import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/auth"
import { getSampleDownloadUrl } from "@/lib/compiler"

// GET /api/datasets/[datasetId]/sample — generate free presigned URL for sample
export async function GET(req: NextRequest, { params }: { params: { datasetId: string } }) {
  const dataset = await prisma.dataset.findUnique({
    where: { id: params.datasetId },
    select: { id: true, sampleUrl: true, status: true, name: true },
  })

  if (!dataset || dataset.status !== "AVAILABLE") {
    return NextResponse.json({ error: "Dataset not found or not available" }, { status: 404 })
  }

  if (!dataset.sampleUrl) {
    return NextResponse.json({ error: "Sample not yet generated for this dataset" }, { status: 404 })
  }

  try {
    const url = await getSampleDownloadUrl(dataset.sampleUrl)
    return NextResponse.json({ url, expiresIn: 900, name: dataset.name })
  } catch (err) {
    console.error("Sample URL generation failed:", err)
    return NextResponse.json({ error: "Failed to generate sample URL" }, { status: 500 })
  }
}
