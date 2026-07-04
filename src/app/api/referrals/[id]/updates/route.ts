import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canUpdateAssignedReferral, getChildScope, mergeWhere } from "@/lib/permissions";

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

    const { id } = await params;
    const { status, note } = await request.json();

    if (!status || !note) {
      return NextResponse.json({ error: "Status and note are required" }, { status: 400 });
    }

    const updatedReferral = await prisma.$transaction(async (tx) => {
      const referral = await tx.referral.findFirst({
        where: mergeWhere({ id }, getChildScope(session)),
      });

      if (!referral) {
        throw new Error("Referral not found");
      }
      if (!canUpdateAssignedReferral(session, referral)) {
        throw new Error("Forbidden");
      }

      // Safeguard: Referral closure rules
      if (status === "CLOSED") {
        const isSupervisorOrAdmin = session.role === "SUPERVISOR" || session.role === "ADMIN";
        const isReadyForClose = referral.status === "COMPLETED" || referral.status === "ESCALATED";

        if (!isSupervisorOrAdmin && !isReadyForClose) {
          throw new Error(
            "Referral cannot be directly closed. It must be marked as COMPLETED or ESCALATED first, unless closed by a supervisor."
          );
        }
      }

      // Update dates based on status
      const dataToUpdate: any = { status, updatedAt: new Date() };
      if (status === "COMPLETED") {
        dataToUpdate.completedAt = new Date();
      } else if (status === "CLOSED") {
        dataToUpdate.closedAt = new Date();
      }

      const ref = await tx.referral.update({
        where: { id },
        data: dataToUpdate,
      });

      // Create history note
      await tx.referralUpdate.create({
        data: {
          referralId: id,
          status,
          note,
          updatedByUserId: session.userId,
        },
      });

      return ref;
    });

    return NextResponse.json({ success: true, referral: updatedReferral });
  } catch (error: any) {
    console.error("Referral Update API Error:", error);
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
