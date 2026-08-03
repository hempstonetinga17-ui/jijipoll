import { NextRequest, NextResponse } from "next/server"
import { auth, prisma } from "@/lib/auth"
import { getDatasetDownloadUrl } from "@/lib/compiler"
import crypto from "crypto"

// POST /api/orders/[orderId]/pay — admin marks order as paid and generates download link
export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPERVISOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { notes, paymentRef } = body

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { dataset: true },
  })

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (order.status === "DELIVERED") return NextResponse.json({ error: "Order already delivered" }, { status: 400 })

  // Generate presigned download URL (72 hours)
  const storageKey = `${order.datasetId}/v${order.dataset.version}/`
  let downloadUrl: string
  try {
    downloadUrl = await getDatasetDownloadUrl(storageKey)
  } catch (err) {
    // If R2 isn't configured yet, provide a placeholder
    downloadUrl = `https://storage.jijipoll.com/${storageKey}metadata.json`
  }

  const downloadExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000)

  // Generate a simple license hash (SHA-256 of order details + timestamp)
  const licenseText = `ORDER:${order.id} BUYER:${order.buyerEmail} DATASET:${order.datasetId} LICENSE:${order.licenseType} DATE:${new Date().toISOString()}`
  const licenseHash = crypto.createHash("sha256").update(licenseText).digest("hex")

  const updated = await prisma.order.update({
    where: { id: params.orderId },
    data: {
      status: "DELIVERED",
      downloadUrl,
      downloadExpiry,
      paidAt: new Date(),
      paidBy: session.user.id,
      licenseSignedAt: new Date(),
      licenseHash,
      notes: notes || null,
      paymentRef: paymentRef || null,
    },
  })

  // Log the delivery
  await prisma.accessLog.create({
    data: {
      orderId: params.orderId,
      ip: null,
      userAgent: "admin-approval",
      action: "DOWNLOAD",
    },
  })

  return NextResponse.json({
    success: true,
    downloadUrl,
    downloadExpiry,
    licenseHash,
    status: "DELIVERED",
  })
}
