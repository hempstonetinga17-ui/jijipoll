import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/review — submit an annotation/grade for any submission
export async function PATCH(req: NextRequest) {
  return handleReview(req)
}

export async function POST(req: NextRequest) {
  return handleReview(req)
}

async function handleReview(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    submissionType, // 'audio' | 'text' | 'video'
    submissionId,
    grade,
    approved,
    notes,
    labels,
    phoneticMarking,
    culturalNote,
    feedback,
  } = body

  const annotatorId = (session.user as any).id

  // Create annotation record
  const annotation = await prisma.annotation.create({
    data: {
      annotatorId,
      ...(submissionType === 'audio' ? { audioSubmissionId: submissionId } : {}),
      ...(submissionType === 'text' ? { textSubmissionId: submissionId } : {}),
      ...(submissionType === 'video' ? { videoSubmissionId: submissionId } : {}),
      grade,
      approved,
      notes,
      labels: labels ?? [],
      phoneticMarking,
      culturalNote,
    },
  })

  // Update the submission status and grade
  const updateData = {
    status: approved ? 'APPROVED' : 'REJECTED',
    grade: grade ?? null,
    feedback: feedback ?? null,
  }

  let sub: any = null
  if (submissionType === 'audio') {
    sub = await prisma.audioSubmission.update({ where: { id: submissionId }, data: updateData })
  } else if (submissionType === 'text') {
    sub = await prisma.textSubmission.update({ where: { id: submissionId }, data: updateData })
  } else if (submissionType === 'video') {
    sub = await prisma.videoSubmission.update({ where: { id: submissionId }, data: updateData })
  }

  // If approved, add points to agent
  if (approved && sub?.agentId && sub?.taskId) {
    const task = await prisma.collectionTask.findUnique({ where: { id: sub.taskId } })
    if (task) {
      await prisma.user.update({
        where: { id: sub.agentId },
        data: { points: { increment: task.rewardPerItem } },
      })
    }
  }

  return NextResponse.json({ annotation })
}
