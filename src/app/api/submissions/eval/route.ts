import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')
  const taskId   = searchParams.get('taskId')
  const domain   = searchParams.get('domain')
  const language = searchParams.get('language')
  const page     = parseInt(searchParams.get('page')  ?? '1')
  const limit    = parseInt(searchParams.get('limit') ?? '20')

  const submissions = await prisma.evalSubmission.findMany({
    where: {
      ...(status   ? { status }   : {}),
      ...(taskId   ? { taskId }   : {}),
      ...(domain   ? { domain }   : {}),
      ...(language ? { language } : {}),
    },
    include: {
      agent: { select: { id: true, name: true, phoneNumber: true } },
      task:  { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await prisma.evalSubmission.count({
    where: {
      ...(status   ? { status }   : {}),
      ...(taskId   ? { taskId }   : {}),
      ...(domain   ? { domain }   : {}),
      ...(language ? { language } : {}),
    },
  })

  return NextResponse.json({ submissions, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    taskId,
    modelName,
    promptText,
    responseText,
    overallRating,
    safetyRating,
    factualRating,
    domainRating,
    hasSafetyIssue,
    safetyNote,
    language,
    domain,
    raterNotes,
  } = body

  if (!promptText || !responseText || overallRating == null) {
    return NextResponse.json(
      { error: 'promptText, responseText, and overallRating are required' },
      { status: 400 }
    )
  }

  const agentId = (session.user as any).id

  const submission = await prisma.evalSubmission.create({
    data: {
      agentId,
      taskId,
      modelName,
      promptText,
      responseText,
      overallRating,
      safetyRating,
      factualRating,
      domainRating,
      hasSafetyIssue: hasSafetyIssue ?? false,
      safetyNote,
      language,
      domain,
      raterNotes,
      status: 'SUBMITTED',
    },
  })

  // Award points immediately for eval submissions (they don't require annotation)
  if (taskId) {
    const task = await prisma.collectionTask.findUnique({ where: { id: taskId } })
    if (task) {
      await prisma.user.update({
        where: { id: agentId },
        data: { points: { increment: task.rewardPerItem } },
      })
    }
  }

  return NextResponse.json(submission, { status: 201 })
}
