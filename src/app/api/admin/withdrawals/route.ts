import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    const withdrawals = await prisma.withdrawalRequest.findMany({
      include: {
        agent: {
          select: { name: true, email: true, phoneNumber: true, points: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    const { withdrawalId, action } = await req.json(); // action = "APPROVE" or "REJECT"

    if (!withdrawalId || !action) {
      return NextResponse.json({ error: "Missing withdrawalId or action" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { agent: true },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json({ error: "Withdrawal is already processed" }, { status: 400 });
    }

    if (action === "APPROVE") {
      // Deduct points from agent and mark approved
      if (withdrawal.agent.points < withdrawal.amount) {
         return NextResponse.json({ error: "Agent does not have enough points" }, { status: 400 });
      }

      const updated = await prisma.$transaction([
        prisma.withdrawalRequest.update({
          where: { id: withdrawalId },
          data: { status: "APPROVED" },
        }),
        prisma.user.update({
          where: { id: withdrawal.agentId },
          data: { points: { decrement: withdrawal.amount } },
        }),
      ]);
      return NextResponse.json({ success: true, withdrawal: updated[0] });
    } else if (action === "REJECT") {
      const updated = await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, withdrawal: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating withdrawal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Agents use this to create a withdrawal
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Check if agent has enough points
    const agent = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!agent || agent.points < amount) {
       return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        agentId: session.user.id,
        amount: parseInt(amount),
      },
    });

    return NextResponse.json({ success: true, withdrawal });
  } catch (error) {
    console.error("Error creating withdrawal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
