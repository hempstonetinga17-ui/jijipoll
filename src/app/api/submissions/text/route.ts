import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const taskId = searchParams.get('taskId')
  const textType = searchParams.get('textType')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')

  const submissions = await prisma.textSubmission.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(taskId ? { taskId } : {}),
      ...(textType ? { textType } : {}),
    },
    include: {
      agent: { select: { id: true, name: true, phoneNumber: true } },
      language: true,
      task: { select: { id: true, title: true } },
      annotations: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await prisma.textSubmission.count({
    where: {
      ...(status ? { status } : {}),
      ...(taskId ? { taskId } : {}),
      ...(textType ? { textType } : {}),
    },
  })

  return NextResponse.json({ submissions, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { taskId, languageId, sourceLanguage, textType, domain, sourceText, submittedText, conversationTurn, parentId } = body

  if (!submittedText) return NextResponse.json({ error: 'submittedText is required' }, { status: 400 })

  const agentId = (session.user as any).id

  const submission = await prisma.textSubmission.create({
    data: {
      agentId,
      taskId,
      languageId,
      sourceLanguage,
      textType: textType ?? 'CORPUS',
      domain,
      sourceText,
      submittedText,
      conversationTurn: conversationTurn ?? 1,
      parentId,
    },
  })
  return NextResponse.json(submission, { status: 201 })
}
