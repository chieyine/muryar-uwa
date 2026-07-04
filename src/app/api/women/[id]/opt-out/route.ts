import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canManageSafeContact, getWomanScope, mergeWhere } from "@/lib/permissions";

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
    if (!canManageSafeContact(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const accessibleWoman = await prisma.woman.findFirst({
      where: mergeWhere({ id }, getWomanScope(session)),
    });
    if (!accessibleWoman) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const woman = await prisma.$transaction(async (tx) => {
      // 1. Opt out woman
      const w = await tx.woman.update({
        where: { id },
        data: {
          safeContactStatus: "OPTED_OUT",
          status: "OPTED_OUT",
        },
      });

      // 2. Log safe contact change
      await tx.safeContactAssessment.create({
        data: {
          womanId: id,
          ownsPhone: false,
          sharedPhone: false,
          safeForCalls: false,
          safeForSms: false,
          safeForWhatsapp: false,
          neutralMessagesOnly: false,
          mobilizerFollowUpPreferred: false,
          directContactAllowed: false,
          assessedByUserId: session.userId,
        },
      });

      return w;
    });

    return NextResponse.json({ success: true, woman });
  } catch (error: any) {
    console.error("Opt Out API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
