import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAssignOutreach, canCreateReferral, getWomanScope, mergeWhere } from "@/lib/permissions";

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
    if (!canCreateReferral(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { referralType, priority, reason, destination, dueDate, assignedToUserId } = body;

    if (!referralType || !priority || !reason) {
      return NextResponse.json({ error: "Missing required referral fields" }, { status: 400 });
    }
    if (assignedToUserId && !canAssignOutreach(session.role)) {
      return NextResponse.json({ error: "Only supervisors and admins can assign outreach workers" }, { status: 403 });
    }
    if (assignedToUserId) {
      const mobilizer = await prisma.user.findFirst({
        where: mergeWhere(
          { id: assignedToUserId, role: "MOBILIZER", isActive: true },
          session.role === "SUPERVISOR" && session.lgaId ? { lgaId: session.lgaId } : {}
        ),
        select: { id: true },
      });
      if (!mobilizer) {
        return NextResponse.json({ error: "Assigned mobilizer is outside your assignment scope" }, { status: 403 });
      }
    }
    const woman = await prisma.woman.findFirst({
      where: mergeWhere({ id }, getWomanScope(session)),
    });
    if (!woman) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const ref = await prisma.$transaction(async (tx) => {
      const referral = await tx.referral.create({
        data: {
          womanId: id,
          referralType,
          priority,
          status: "IDENTIFIED",
          reason,
          destination: destination || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          createdByUserId: session.userId,
          assignedToUserId: assignedToUserId || null,
        },
      });

      await tx.referralUpdate.create({
        data: {
          referralId: referral.id,
          status: "IDENTIFIED",
          note: "Referral created manually.",
          updatedByUserId: session.userId,
        },
      });

      return referral;
    });

    return NextResponse.json({ success: true, referral: ref });
  } catch (error: any) {
    console.error("Referral API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
