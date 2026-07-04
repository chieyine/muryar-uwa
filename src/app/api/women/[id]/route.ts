import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAccessFacility, canManageParticipant, getWomanScope, mergeWhere } from "@/lib/permissions";
import { minimizeParticipantForUser } from "@/lib/privacy";

// GET /api/women/:id
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

    const woman = await prisma.woman.findFirst({
      where: mergeWhere({ id }, getWomanScope(session)),
      include: {
        lga: true,
        facility: true,
        safeContactAssessments: {
          orderBy: { assessedAt: "desc" },
        },
        nutritionScreenings: {
          orderBy: { screenedAt: "desc" },
        },
        referrals: {
          orderBy: { createdAt: "desc" },
          include: {
            assignedTo: true,
            createdBy: true,
            updates: {
              orderBy: { createdAt: "desc" },
              include: {
                updatedBy: true,
              },
            },
          },
        },
        messageLogs: {
          orderBy: { scheduledAt: "desc" },
          include: {
            template: true,
          },
        },
        resilienceActivities: {
          orderBy: { activityDate: "desc" },
          include: {
            recordedBy: true,
          },
        },
        missedVisits: {
          orderBy: { expectedDate: "desc" },
          include: {
            assignedTo: true,
          },
        },
        complaints: {
          orderBy: { createdAt: "desc" },
          include: {
            assignedTo: true,
            createdBy: true,
          },
        },
      },
    });

    if (!woman) {
      return NextResponse.json({ error: "Woman not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, woman: minimizeParticipantForUser(woman, session) });
  } catch (error: any) {
    console.error("GET Woman Detail API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/women/:id
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManageParticipant(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const allowedUpdates = [
      "fullName",
      "codedName",
      "age",
      "phone",
      "alternatePhone",
      "lgaId",
      "facilityId",
      "community",
      "pregnancyStatus",
      "breastfeedingStatus",
      "caregiverStatus",
      "childInOtp",
      "childDischargedFromSc",
      "consentGiven",
      "preferredLanguage",
      "preferredChannel",
      "safeContactStatus",
      "safeContactTime",
      "status",
    ];

    const data: any = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        if (key === "age") {
          data[key] = parseInt(body[key]);
        } else if (
          key === "caregiverStatus" ||
          key === "childInOtp" ||
          key === "childDischargedFromSc" ||
          key === "consentGiven"
        ) {
          data[key] = !!body[key];
        } else {
          data[key] = body[key];
        }
      }
    }

    const existingWoman = await prisma.woman.findFirst({
      where: mergeWhere({ id }, getWomanScope(session)),
    });
    if (!existingWoman) {
      return NextResponse.json({ error: "Woman not found" }, { status: 404 });
    }
    if (data.facilityId) {
      const targetFacility = await prisma.facility.findUnique({
        where: { id: data.facilityId },
        select: { id: true, lgaId: true },
      });
      if (!targetFacility || !canAccessFacility(session, targetFacility)) {
        return NextResponse.json({ error: "Invalid facility selection" }, { status: 403 });
      }
      if (data.lgaId && targetFacility.lgaId !== data.lgaId) {
        return NextResponse.json({ error: "Facility does not belong to selected LGA" }, { status: 400 });
      }
      data.lgaId = targetFacility.lgaId;
    }

    const updatedWoman = await prisma.woman.update({
      where: { id: existingWoman.id },
      data,
    });

    return NextResponse.json({ success: true, woman: updatedWoman });
  } catch (error: any) {
    console.error("PATCH Woman Detail API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
