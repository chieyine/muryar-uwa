import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canManageSafeContact, canViewDetailedSafeContact, getWomanScope, mergeWhere } from "@/lib/permissions";

// GET /api/women/:id/safe-contact
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: womanId } = await params;
    const woman = await prisma.woman.findFirst({
      where: mergeWhere({ id: womanId }, getWomanScope(session)),
    });
    if (!woman) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const assessments = await prisma.safeContactAssessment.findMany({
      where: { womanId },
      orderBy: { assessedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      assessments: canViewDetailedSafeContact(session.role)
        ? assessments
        : assessments.map((assessment) => ({
            ...assessment,
            sharedWith: assessment.sharedPhone ? "Hidden" : null,
            unsafeTopics: assessment.unsafeTopics ? "Hidden" : null,
          })),
    });
  } catch (error: any) {
    console.error("GET Safe Contact Assessment API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/women/:id/safe-contact
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManageSafeContact(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: womanId } = await params;
    const body = await request.json();
    const woman = await prisma.woman.findFirst({
      where: mergeWhere({ id: womanId }, getWomanScope(session)),
    });
    if (!woman) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const {
      ownsPhone,
      sharedPhone,
      sharedWith,
      safeForCalls,
      safeForSms,
      safeForWhatsapp,
      preferredTime,
      neutralMessagesOnly,
      unsafeTopics,
      mobilizerFollowUpPreferred,
      directContactAllowed,
      safeContactStatus, // to update on Woman
    } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Safe Contact Assessment
      const assessment = await tx.safeContactAssessment.create({
        data: {
          womanId,
          ownsPhone: !!ownsPhone,
          sharedPhone: !!sharedPhone,
          sharedWith: sharedWith || null,
          safeForCalls: !!safeForCalls,
          safeForSms: !!safeForSms,
          safeForWhatsapp: !!safeForWhatsapp,
          preferredTime: preferredTime || null,
          neutralMessagesOnly: !!neutralMessagesOnly,
          unsafeTopics: unsafeTopics || null,
          mobilizerFollowUpPreferred: !!mobilizerFollowUpPreferred,
          directContactAllowed: !!directContactAllowed,
          assessedByUserId: session.userId,
        },
      });

      // 2. Update Woman table with the status and preferred contact time
      const updateData: any = {};
      if (safeContactStatus) {
        updateData.safeContactStatus = safeContactStatus;
        if (safeContactStatus === "OPTED_OUT") {
          updateData.status = "OPTED_OUT";
        } else {
          updateData.status = "ACTIVE";
        }
      }
      if (preferredTime) {
        updateData.safeContactTime = preferredTime;
      }

      if (Object.keys(updateData).length > 0) {
        await tx.woman.update({
          where: { id: womanId },
          data: updateData,
        });
      }

      return assessment;
    });

    return NextResponse.json({ success: true, assessment: result });
  } catch (error: any) {
    console.error("POST Safe Contact Assessment API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/women/:id/safe-contact
// In practice, this might update the latest safe contact assessment
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManageSafeContact(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: womanId } = await params;
    const body = await request.json();
    const woman = await prisma.woman.findFirst({
      where: mergeWhere({ id: womanId }, getWomanScope(session)),
    });
    if (!woman) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    // Find the latest assessment
    const latestAssessment = await prisma.safeContactAssessment.findFirst({
      where: { womanId },
      orderBy: { assessedAt: "desc" },
    });

    if (!latestAssessment) {
      return NextResponse.json({ error: "No safe contact assessment found to update" }, { status: 404 });
    }

    const allowedUpdates = [
      "ownsPhone",
      "sharedPhone",
      "sharedWith",
      "safeForCalls",
      "safeForSms",
      "safeForWhatsapp",
      "preferredTime",
      "neutralMessagesOnly",
      "unsafeTopics",
      "mobilizerFollowUpPreferred",
      "directContactAllowed",
    ];

    const data: any = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        if (
          key === "ownsPhone" ||
          key === "sharedPhone" ||
          key === "safeForCalls" ||
          key === "safeForSms" ||
          key === "safeForWhatsapp" ||
          key === "neutralMessagesOnly" ||
          key === "mobilizerFollowUpPreferred" ||
          key === "directContactAllowed"
        ) {
          data[key] = !!body[key];
        } else {
          data[key] = body[key];
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Safe Contact Assessment
      const updatedAssessment = await tx.safeContactAssessment.update({
        where: { id: latestAssessment.id },
        data,
      });

      // 2. Update Woman attributes if provided
      const updateData: any = {};
      if (body.safeContactStatus) {
        updateData.safeContactStatus = body.safeContactStatus;
        if (body.safeContactStatus === "OPTED_OUT") {
          updateData.status = "OPTED_OUT";
        } else {
          updateData.status = "ACTIVE";
        }
      }
      if (body.preferredTime) {
        updateData.safeContactTime = body.preferredTime;
      }

      if (Object.keys(updateData).length > 0) {
        await tx.woman.update({
          where: { id: womanId },
          data: updateData,
        });
      }

      return updatedAssessment;
    });

    return NextResponse.json({ success: true, assessment: result });
  } catch (error: any) {
    console.error("PATCH Safe Contact Assessment API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
