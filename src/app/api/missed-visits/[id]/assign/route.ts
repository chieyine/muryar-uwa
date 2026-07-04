import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAssignOutreach, getChildScope, mergeWhere } from "@/lib/permissions";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAssignOutreach(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { assignedToUserId } = await request.json();

    if (!assignedToUserId) {
      return NextResponse.json({ error: "Mobilizer ID is required" }, { status: 400 });
    }
    const visitToAssign = await prisma.missedVisit.findFirst({
      where: mergeWhere({ id }, getChildScope(session)),
    });
    if (!visitToAssign) {
      return NextResponse.json({ error: "Missed visit not found" }, { status: 404 });
    }
    const mobilizer = await prisma.user.findFirst({
      where: mergeWhere(
        { id: assignedToUserId, role: "MOBILIZER", isActive: true },
        session.role === "SUPERVISOR" && session.lgaId ? { lgaId: session.lgaId } : {}
      ),
      select: { id: true },
    });
    if (!mobilizer) {
      return NextResponse.json({ error: "Mobilizer is outside your assignment scope" }, { status: 403 });
    }

    const visit = await prisma.missedVisit.update({
      where: { id: visitToAssign.id },
      data: {
        assignedToUserId,
        status: "CONTACTED",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, visit });
  } catch (error: any) {
    console.error("Missed Visit Assign Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
