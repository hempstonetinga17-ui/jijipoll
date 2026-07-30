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

    const { role } = await req.json();

    if (!role || !["AGENT", "SUPERVISOR"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be AGENT or SUPERVISOR." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: params.agentId },
      data: { role },
    });

    return NextResponse.json({ success: true, agent: { id: updated.id, role: updated.role } });
  } catch (error: any) {
    console.error("Error promoting agent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
