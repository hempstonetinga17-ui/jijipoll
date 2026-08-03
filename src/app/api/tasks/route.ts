import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/tasks — list tasks (optionally filter by type/status)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const taskType = searchParams.get('taskType')
  const status = searchParams.get('status') ?? 'ACTIVE'

  const tasks = await prisma.collectionTask.findMany({
    where: {
      ...(taskType ? { taskType } : {}),
      status,
    },
    include: {
      language: true,
      _count: {
        select: {
          audioSubmissions: true,
          textSubmissions: true,
          videoSubmissions: true,
          evalSubmissions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tasks)
}

// POST /api/tasks — create a new collection task
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, description, taskType, domain, languageId, prompts, targetCount, rewardPerItem, deadline, isPublic } = body

  if (!title || !taskType) {
    return NextResponse.json({ error: 'title and taskType are required' }, { status: 400 })
  }

  const task = await prisma.collectionTask.create({
    data: {
      title,
      description,
      taskType,
      domain,
      languageId,
      prompts: prompts ?? [],
      targetCount: targetCount ?? 100,
      rewardPerItem: rewardPerItem ?? 5,
      deadline: deadline ? new Date(deadline) : null,
      isPublic: isPublic ?? true,
    },
  })
  return NextResponse.json(task, { status: 201 })
}
