import { NextResponse } from "next/server";
import { prisma } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { agentPromoteSchema } from "@/lib/validate";

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

    const body = await req.json();
    const result = agentPromoteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    const { role } = result.data;

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
