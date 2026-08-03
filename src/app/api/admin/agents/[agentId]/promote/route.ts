import { auth, prisma } from "@/lib/auth"
import { NextResponse } from "next/server"
import { agentPromoteSchema } from "@/lib/validate"

const QA_PROMOTABLE = ["AGENT", "REVIEWER"] // QA can only promote to REVIEWER
const ADMIN_PROMOTABLE = ["AGENT", "REVIEWER", "SUPERVISOR", "PROJECT_MANAGER", "ADMIN"]

export async function POST(
  req: Request,
  { params }: { params: { agentId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const isAdmin = session.user.role === "ADMIN"
  const isQA = session.user.role === "SUPERVISOR"

  if (!isAdmin && !isQA) {
    return NextResponse.json({ error: "Only Admins and QA Supervisors can promote agents" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = agentPromoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { role } = parsed.data

  // QA can only promote to REVIEWER
  if (isQA && !QA_PROMOTABLE.includes(role)) {
    return NextResponse.json({ error: "QA Supervisors can only promote agents to REVIEWER" }, { status: 403 })
  }

  if (params.agentId === session.user.id) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: params.agentId } })
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id: params.agentId },
    data: { role },
    select: { id: true, name: true, role: true }
  })

  return NextResponse.json(updated)
}
