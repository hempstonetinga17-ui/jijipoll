import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await req.json();

    const validStatuses = ["ACTIVE", "FLAGGED", "SUSPENDED", "PENDING"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: params.agentId },
      data: { status },
    });

    return NextResponse.json({ success: true, agent: { id: updated.id, status: updated.status } });
  } catch (error: any) {
    console.error("Error setting agent status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
