import { auth, prisma } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const dataType = searchParams.get("dataType")

  const datasets = await prisma.dataset.findMany({
    where: {
      ...(status ? { status } : { status: { in: ["AVAILABLE", "COMPILING"] } }),
      ...(dataType ? { dataType } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, description: true, version: true,
      dataType: true, format: true, languages: true,
      itemCount: true, averageGrade: true, qualityTier: true,
      license: true, priceUsd: true, status: true,
      sampleUrl: true, datasetCard: true,
      compiledAt: true, createdAt: true,
    }
  })

  return NextResponse.json(datasets)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, dataType, format, languages, license, priceUsd, taskIds, qualityThreshold } = body

  if (!name || !dataType) {
    return NextResponse.json({ error: "name and dataType are required" }, { status: 400 })
  }

  // Count verified submissions for the selected tasks
  const itemCount = await prisma.dataSubmission.count({
    where: {
      status: "VERIFIED",
      ...(taskIds?.length ? {} : {}), // TODO: link to tasks when task relation added
    }
  })

  // Compute average QA grade
  const gradeAgg = await prisma.dataSubmission.aggregate({
    where: { status: "VERIFIED", qaGrade: { not: null } },
    _avg: { qaGrade: true }
  })
  const avgGrade = gradeAgg._avg.qaGrade || 0
  const qualityTier = avgGrade >= 90 ? "A" : avgGrade >= 80 ? "B" : "C"

  const dataset = await prisma.dataset.create({
    data: {
      name,
      description: description || null,
      dataType,
      format: format || "RAW",
      languages: languages || [],
      license: license || "RESEARCH",
      priceUsd: priceUsd || 0,
      taskIds: taskIds || [],
      itemCount,
      averageGrade: avgGrade,
      qualityTier,
      compiledBy: session.user.id,
      status: "COMPILING",
    }
  })

  return NextResponse.json(dataset)
}
