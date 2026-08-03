import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const task = await prisma.collectionTask.findUnique({
    where: { id: params.id },
    include: {
      language: true,
      _count: { select: { audioSubmissions: true, textSubmissions: true, videoSubmissions: true, evalSubmissions: true } },
    },
  })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const task = await prisma.collectionTask.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(task)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.collectionTask.update({
    where: { id: params.id },
    data: { status: 'CLOSED' }, // Soft delete — archive rather than destroy
  })
  return NextResponse.json({ success: true })
}
