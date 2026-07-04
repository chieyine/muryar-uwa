import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canCreateResilienceActivity, getWomanScope, mergeWhere } from "@/lib/permissions";

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
    if (!canCreateResilienceActivity(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { activityType, eligibilityReason, status, activityDate, notes } = body;

    if (!activityType || !eligibilityReason || !status || !activityDate) {
      return NextResponse.json({ error: "Missing required activity fields" }, { status: 400 });
    }
    const woman = await prisma.woman.findFirst({
      where: mergeWhere({ id }, getWomanScope(session)),
    });
    if (!woman) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const act = await prisma.nutritionResilienceActivity.create({
      data: {
        womanId: id,
        activityType,
        eligibilityReason,
        status,
        activityDate: new Date(activityDate),
        followUpDate: status === "COMPLETED" || status === "RECEIVED" ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
        notes: notes || null,
        recordedByUserId: session.userId,
      },
    });

    return NextResponse.json({ success: true, activity: act });
  } catch (error: any) {
    console.error("Resilience API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
