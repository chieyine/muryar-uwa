import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAssignOutreach, getChildScope, getWomanScope, mergeWhere } from "@/lib/permissions";
import { minimizeParticipantForUser } from "@/lib/privacy";

// GET /api/missed-visits
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const visitType = searchParams.get("visitType");
    const assignedToUserId = searchParams.get("assignedToUserId");
    const facilityId = searchParams.get("facilityId");
    const lgaId = searchParams.get("lgaId");

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (visitType) filter.visitType = visitType;
    if (assignedToUserId) filter.assignedToUserId = assignedToUserId;

    if (facilityId || lgaId) {
      filter.woman = {};
      if (facilityId) filter.woman.facilityId = facilityId;
      if (lgaId) filter.woman.lgaId = lgaId;
    }

    if (session.role === "MOBILIZER") filter.assignedToUserId = session.userId;

    const missedVisits = await prisma.missedVisit.findMany({
      where: mergeWhere(getChildScope(session), filter),
      include: {
        woman: {
          include: {
            facility: true,
            lga: true,
          },
        },
        assignedTo: true,
      },
      orderBy: { expectedDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      missedVisits: missedVisits.map((visit) => ({
        ...visit,
        woman: minimizeParticipantForUser(visit.woman, session),
      })),
    });
  } catch (error: any) {
    console.error("GET Missed Visits API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/missed-visits
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { womanId, visitType, expectedDate, assignedToUserId, reasonForMissedVisit } = body;

    if (!womanId || !visitType || !expectedDate) {
      return NextResponse.json(
        { error: "Missing required fields: womanId, visitType, expectedDate" },
        { status: 400 }
      );
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

    const accessibleWoman = await prisma.woman.findFirst({
      where: mergeWhere({ id: womanId }, getWomanScope(session)),
      select: { id: true },
    });

    if (!accessibleWoman) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newVisit = await prisma.missedVisit.create({
      data: {
        womanId,
        visitType,
        expectedDate: new Date(expectedDate),
        status: "OPEN",
        assignedToUserId: assignedToUserId || null,
        reasonForMissedVisit: reasonForMissedVisit || null,
      },
    });

    return NextResponse.json({ success: true, visit: newVisit });
  } catch (error: any) {
    console.error("POST Missed Visit API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
