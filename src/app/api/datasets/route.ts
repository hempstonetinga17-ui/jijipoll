import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/auth"

// GET /api/datasets — public catalog (no auth required)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dataType = searchParams.get("type")
  const language = searchParams.get("language")
  const maxPrice = searchParams.get("maxPrice")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "12")

  const where: any = { status: "AVAILABLE" }
  if (dataType) where.dataType = dataType
  if (language) where.languages = { has: language }
  if (maxPrice) where.priceUsd = { lte: parseFloat(maxPrice) }

  const [datasets, total] = await Promise.all([
    prisma.dataset.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        dataType: true,
        format: true,
        languages: true,
        itemCount: true,
        totalDurationSecs: true,
        averageGrade: true,
        qualityTier: true,
        license: true,
        priceUsd: true,
        sampleUrl: true,
        version: true,
        compiledAt: true,
      },
      orderBy: { compiledAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dataset.count({ where }),
  ])

  return NextResponse.json({ datasets, total, page, limit })
}
