import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/auth"

// POST /api/orders — create a new order (buyer facing, no auth required for now)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { datasetId, buyerName, buyerEmail, buyerOrg, licenseType } = body

  if (!datasetId || !buyerName || !buyerEmail || !licenseType) {
    return NextResponse.json({ error: "datasetId, buyerName, buyerEmail, licenseType are required" }, { status: 400 })
  }

  const dataset = await prisma.dataset.findUnique({
    where: { id: datasetId },
    select: { id: true, status: true, priceUsd: true, license: true, name: true },
  })

  if (!dataset || dataset.status !== "AVAILABLE") {
    return NextResponse.json({ error: "Dataset not available for purchase" }, { status: 404 })
  }

  const validLicenses = ["RESEARCH", "COMMERCIAL", "EXCLUSIVE"]
  if (!validLicenses.includes(licenseType)) {
    return NextResponse.json({ error: "Invalid licenseType" }, { status: 400 })
  }

  // Pricing multiplier by license type
  const priceMultiplier = licenseType === "EXCLUSIVE" ? 7.5 : licenseType === "COMMERCIAL" ? 1.0 : 0.5
  const amountUsd = dataset.priceUsd * priceMultiplier

  const ipAtPurchase = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined

  const order = await prisma.order.create({
    data: {
      datasetId,
      buyerName,
      buyerEmail,
      buyerOrg: buyerOrg || null,
      licenseType,
      amountUsd,
      status: "PENDING",
      ipAtPurchase: ipAtPurchase || null,
    },
  })

  return NextResponse.json({
    success: true,
    orderId: order.id,
    amountUsd,
    status: "PENDING",
    message: "Order created. An admin will confirm payment and generate your download link.",
  }, { status: 201 })
}

// GET /api/orders — list orders by buyerEmail (buyer) or all (admin)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  const adminKey = req.headers.get("x-admin-key")

  const isAdmin = adminKey === process.env.ADMIN_API_KEY

  if (!email && !isAdmin) {
    return NextResponse.json({ error: "email param or admin key required" }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: email ? { buyerEmail: email } : {},
    include: {
      dataset: { select: { id: true, name: true, version: true, dataType: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ orders })
}
