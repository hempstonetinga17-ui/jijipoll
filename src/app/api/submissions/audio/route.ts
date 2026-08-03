import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const taskId = searchParams.get('taskId')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')

  const submissions = await prisma.audioSubmission.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(taskId ? { taskId } : {}),
    },
    include: {
      agent: { select: { id: true, name: true, phoneNumber: true } },
      language: true,
      task: { select: { id: true, title: true } },
      annotations: { include: { annotator: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await prisma.audioSubmission.count({
    where: {
      ...(status ? { status } : {}),
      ...(taskId ? { taskId } : {}),
    },
  })

  return NextResponse.json({ submissions, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    taskId, languageId, dialect, audioUrl, durationSecs,
    scriptPrompt, isScripted, audioType, environment,
    speakerGender, speakerAge, latitude, longitude
  } = body

  if (!audioUrl) return NextResponse.json({ error: 'audioUrl is required' }, { status: 400 })

  const agentId = (session.user as any).id

  const submission = await prisma.audioSubmission.create({
    data: {
      agentId,
      taskId,
      languageId,
      dialect,
      audioUrl,
      durationSecs,
      scriptPrompt,
      isScripted: isScripted ?? true,
      audioType: audioType ?? 'MONOLOGUE',
      environment: environment ?? 'INDOOR',
      speakerGender,
      speakerAge,
      latitude,
      longitude,
    },
  })
  return NextResponse.json(submission, { status: 201 })
}
