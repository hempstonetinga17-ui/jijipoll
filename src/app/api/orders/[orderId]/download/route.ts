import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/auth"
import { getDatasetDownloadUrl } from "@/lib/compiler"

// GET /api/orders/[orderId]/download — buyer re-download (generates fresh presigned URL)
export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "email query param required for verification" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { dataset: true },
  })

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  // Verify buyer identity by email
  if (order.buyerEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Email does not match order" }, { status: 403 })
  }

  if (order.status !== "DELIVERED") {
    return NextResponse.json({ error: "Order not yet paid/delivered" }, { status: 400 })
  }

  // Check license expiry for EXCLUSIVE licenses (12 months)
  if (order.licenseType === "EXCLUSIVE" && order.paidAt) {
    const expiryDate = new Date(order.paidAt)
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    if (new Date() > expiryDate) {
      return NextResponse.json({ error: "Exclusive license has expired" }, { status: 403 })
    }
  }

  const storageKey = `${order.datasetId}/v${order.dataset.version}/`
  let freshUrl: string
  try {
    freshUrl = await getDatasetDownloadUrl(storageKey)
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 })
  }

  const ip = req.headers.get("x-forwarded-for") || undefined
  const userAgent = req.headers.get("user-agent") || undefined

  // Log the re-download
  await Promise.all([
    prisma.accessLog.create({
      data: {
        orderId: params.orderId,
        ip: ip || null,
        userAgent: userAgent || null,
        action: "REDOWNLOAD",
      },
    }),
    prisma.order.update({
      where: { id: params.orderId },
      data: { redownloadCount: { increment: 1 } },
    }),
  ])

  return NextResponse.json({
    downloadUrl: freshUrl,
    expiresIn: 72 * 3600,
    checksum: order.checksum || null,
    licenseHash: order.licenseHash || null,
    datasetName: order.dataset.name,
    version: order.dataset.version,
  })
}
