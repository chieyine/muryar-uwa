import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getChildScope, getWomanScope, mergeWhere } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lgaId = searchParams.get("lgaId");
    const facilityId = searchParams.get("facilityId");

    const filter: any = {};
    if (lgaId) filter.lgaId = lgaId;
    if (facilityId) filter.facilityId = facilityId;

    const childFilter: any = {};
    if (lgaId || facilityId) {
      childFilter.woman = {};
      if (lgaId) childFilter.woman.lgaId = lgaId;
      if (facilityId) childFilter.woman.facilityId = facilityId;
    }

    const womanFilter = mergeWhere(getWomanScope(session), filter);
    const childFilterWithScope = mergeWhere(getChildScope(session), childFilter);

    const totalWomenEnrolled = await prisma.woman.count({ where: womanFilter });
    const activeDigitalUsers = await prisma.woman.count({
      where: mergeWhere(womanFilter, { status: "ACTIVE" }),
    });
    const safeContactCompleted = await prisma.safeContactAssessment.count({
      where: childFilterWithScope,
    });
    const openReferrals = await prisma.referral.count({
      where: mergeWhere(childFilterWithScope, { status: { notIn: ["COMPLETED", "CLOSED"] } }),
    });
    const missedVisitsCount = await prisma.missedVisit.count({
      where: mergeWhere(childFilterWithScope, { status: "OPEN" }),
    });
    const lowMuacCount = await prisma.nutritionScreening.count({
      where: mergeWhere(childFilterWithScope, { muacCm: { lt: 23.0 } }),
    });
    const criticalFlagsCount = await prisma.complaintOrSafeguardingFlag.count({
      where: mergeWhere(childFilterWithScope, { severity: "CRITICAL", status: "OPEN" }),
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalWomenEnrolled,
        activeDigitalUsers,
        safeContactCompleted,
        openReferrals,
        missedVisitsCount,
        lowMuacCount,
        criticalFlagsCount,
      },
    });
  } catch (error: any) {
    console.error("Dashboard Summary Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
