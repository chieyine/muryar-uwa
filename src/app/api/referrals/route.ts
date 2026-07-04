import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAssignOutreach, canCreateReferral, getChildScope, getWomanScope, mergeWhere } from "@/lib/permissions";
import { minimizeParticipantForUser } from "@/lib/privacy";

// GET /api/referrals
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const referralType = searchParams.get("referralType");
    const priority = searchParams.get("priority");
    const assignedToUserId = searchParams.get("assignedToUserId");
    const facilityId = searchParams.get("facilityId");
    const lgaId = searchParams.get("lgaId");

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (referralType) filter.referralType = referralType;
    if (priority) filter.priority = priority;
    if (assignedToUserId) filter.assignedToUserId = assignedToUserId;

    if (facilityId || lgaId) {
      filter.woman = {};
      if (facilityId) filter.woman.facilityId = facilityId;
      if (lgaId) filter.woman.lgaId = lgaId;
    }

    if (session.role === "MOBILIZER") filter.assignedToUserId = session.userId;

    const referrals = await prisma.referral.findMany({
      where: mergeWhere(getChildScope(session), filter),
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
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      referrals: referrals.map((referral) => ({
        ...referral,
        woman: minimizeParticipantForUser(referral.woman, session),
      })),
    });
  } catch (error: any) {
    console.error("GET Referrals API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/referrals
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canCreateReferral(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      womanId,
      referralType,
      priority,
      reason,
      destination,
      dueDate,
      assignedToUserId,
    } = body;

    if (!womanId || !referralType || !priority || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: womanId, referralType, priority, reason" },
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

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Referral
      const referral = await tx.referral.create({
        data: {
          womanId,
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

      // 2. Create initial ReferralUpdate
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

    return NextResponse.json({ success: true, referral: result });
  } catch (error: any) {
    console.error("POST Referral API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
