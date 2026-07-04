import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getChildScope, getFacilityScope, getWomanScope, mergeWhere } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const facilities = await prisma.facility.findMany({
      where: getFacilityScope(session),
    });

    const performance = await Promise.all(
      facilities.map(async (f) => {
        const facilityWomanWhere = mergeWhere(getWomanScope(session), { facilityId: f.id });
        const facilityChildWhere = mergeWhere(getChildScope(session), { woman: { facilityId: f.id } });
        const enrolled = await prisma.woman.count({
          where: facilityWomanWhere,
        });

        // Referrals completed / total for women at this facility
        const totalReferrals = await prisma.referral.count({
          where: facilityChildWhere,
        });

        const completedReferrals = await prisma.referral.count({
          where: mergeWhere(facilityChildWhere, { status: "COMPLETED" }),
        });

        const completionRate = totalReferrals > 0
          ? Math.round((completedReferrals / totalReferrals) * 100)
          : 0;

        return {
          facilityId: f.id,
          facilityName: f.name,
          enrolledCount: enrolled,
          referralCompletionRate: completionRate,
          totalReferrals,
          completedReferrals,
        };
      })
    );

    // Sort by enrolment count descending
    performance.sort((a, b) => b.enrolledCount - a.enrolledCount);

    return NextResponse.json({
      success: true,
      performance,
    });
  } catch (error: any) {
    console.error("Dashboard PHC Performance Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
