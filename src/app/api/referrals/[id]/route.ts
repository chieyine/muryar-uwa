import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAssignOutreach, canUpdateAssignedReferral, getChildScope, mergeWhere } from "@/lib/permissions";
import { minimizeParticipantForUser } from "@/lib/privacy";

// GET /api/referrals/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const referral = await prisma.referral.findFirst({
      where: mergeWhere({ id }, getChildScope(session)),
      include: {
        woman: {
          include: {
            facility: true,
            lga: true,
          },
        },
        assignedTo: true,
        createdBy: true,
        updates: {
          orderBy: { createdAt: "desc" },
          include: {
            updatedBy: true,
          },
        },
      },
    });

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      referral: {
        ...referral,
        woman: minimizeParticipantForUser(referral.woman, session),
      },
    });
  } catch (error: any) {
    console.error("GET Referral Detail API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/referrals/:id
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const allowedUpdates = [
      "referralType",
      "priority",
      "status",
      "reason",
      "destination",
      "dueDate",
      "assignedToUserId",
    ];

    const data: any = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        if (key === "dueDate") {
          data[key] = body[key] ? new Date(body[key]) : null;
        } else {
          data[key] = body[key];
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const referral = await tx.referral.findFirst({
        where: mergeWhere({ id }, getChildScope(session)),
      });

      if (!referral) {
        throw new Error("Referral not found");
      }
      if (!canUpdateAssignedReferral(session, referral)) {
        throw new Error("Forbidden");
      }
      if (data.assignedToUserId && !canAssignOutreach(session.role)) {
        throw new Error("Only supervisors and admins can assign referrals.");
      }
      if (data.assignedToUserId) {
        const mobilizer = await tx.user.findFirst({
          where: mergeWhere(
            { id: data.assignedToUserId, role: "MOBILIZER", isActive: true },
            session.role === "SUPERVISOR" && session.lgaId ? { lgaId: session.lgaId } : {}
          ),
          select: { id: true },
        });
        if (!mobilizer) {
          throw new Error("Assigned mobilizer is outside your assignment scope.");
        }
      }

      // Check closure rule if status is changing to CLOSED
      if (data.status === "CLOSED" && referral.status !== "CLOSED") {
        const isSupervisorOrAdmin = session.role === "SUPERVISOR" || session.role === "ADMIN";
        const isReadyForClose = referral.status === "COMPLETED" || referral.status === "ESCALATED";

        if (!isSupervisorOrAdmin && !isReadyForClose) {
          throw new Error(
            "Referral cannot be directly closed. It must be marked as COMPLETED or ESCALATED first, unless closed by a supervisor."
          );
        }
        data.closedAt = new Date();
      }

      if (data.status === "COMPLETED" && referral.status !== "COMPLETED") {
        data.completedAt = new Date();
      }

      const updated = await tx.referral.update({
        where: { id },
        data,
      });

      // Create history note if status changed
      if (data.status && data.status !== referral.status) {
        await tx.referralUpdate.create({
          data: {
            referralId: id,
            status: data.status,
            note: `Status updated via PATCH.`,
            updatedByUserId: session.userId,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, referral: result });
  } catch (error: any) {
    console.error("PATCH Referral Detail API Error:", error);
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
