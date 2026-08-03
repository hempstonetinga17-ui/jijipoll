import { NextRequest, NextResponse } from "next/server"
import { auth, prisma } from "@/lib/auth"
import { compileDataset } from "@/lib/compiler"

const ADMIN_ROLES = ["ADMIN", "SUPERVISOR"]

// POST /api/admin/datasets/compile
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const {
    name, description, taskIds, languageIds, dateFrom, dateTo,
    dataType, format, licenseType, priceUsd,
  } = body

  if (!name || !dataType || !format || !licenseType || priceUsd === undefined) {
    return NextResponse.json({
      error: "name, dataType, format, licenseType, and priceUsd are required",
    }, { status: 400 })
  }

  // Create the Dataset record immediately (COMPILING status)
  const dataset = await prisma.dataset.create({
    data: {
      name,
      description: description || null,
      dataType,
      format,
      license: licenseType,
      priceUsd: parseFloat(priceUsd),
      status: "COMPILING",
      compiledBy: session.user.id,
      taskIds: taskIds || [],
    },
  })

  // Run compilation as a background task (fire-and-forget)
  // In production use a queue worker; here we use a non-blocking Promise
  compileDataset(dataset.id, {
    name,
    description,
    taskIds: taskIds || [],
    languageIds: languageIds || [],
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
    dataType,
    format,
    licenseType,
    priceUsd: parseFloat(priceUsd),
    compiledBy: session.user.id,
  }).catch(async (err) => {
    console.error(`[Compiler] Failed for dataset ${dataset.id}:`, err)
    await prisma.dataset.update({
      where: { id: dataset.id },
      data: { status: "ARCHIVED", datasetCard: `# Compile Error\n\n${err.message}` },
    })
  })

  return NextResponse.json({
    success: true,
    datasetId: dataset.id,
    status: "COMPILING",
    message: "Dataset compilation started. Refresh in a few moments to check status.",
  }, { status: 202 })
}
