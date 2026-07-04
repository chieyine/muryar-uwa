import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canExportAggregateReports, getChildScope, getFacilityScope, getWomanScope, mergeWhere } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!canExportAggregateReports(session.role)) {
      return new Response("Forbidden", { status: 403 });
    }

    const facilities = await prisma.facility.findMany({
      where: getFacilityScope(session),
      include: {
        lga: true,
      },
      orderBy: { name: "asc" },
    });

    // For each facility, compute referral completion rate, screening count, etc.
    const rows = [];
    for (const f of facilities) {
      const facilityWomanWhere = mergeWhere(getWomanScope(session), { facilityId: f.id });
      const facilityChildWhere = mergeWhere(getChildScope(session), { woman: { facilityId: f.id } });
      const womenEnrolled = await prisma.woman.count({
        where: facilityWomanWhere,
      });
      const totalReferrals = await prisma.referral.count({
        where: facilityChildWhere,
      });
      const completedReferrals = await prisma.referral.count({
        where: mergeWhere(facilityChildWhere, { status: "COMPLETED" }),
      });
      const openReferrals = await prisma.referral.count({
        where: mergeWhere(facilityChildWhere, { status: { notIn: ["COMPLETED", "CLOSED"] } }),
      });
      const screenings = await prisma.nutritionScreening.count({
        where: facilityChildWhere,
      });
      const missedVisits = await prisma.missedVisit.count({
        where: mergeWhere(facilityChildWhere, { status: "OPEN" }),
      });
      const resilienceActivities = await prisma.nutritionResilienceActivity.count({
        where: facilityChildWhere,
      });
      const completionRate = totalReferrals > 0
        ? Math.round((completedReferrals / totalReferrals) * 100)
        : 0;

      rows.push([
        f.name,
        f.lga.name,
        f.type,
        f.hasStarlink ? "Yes" : "No",
        womenEnrolled,
        totalReferrals,
        completedReferrals,
        openReferrals,
        `${completionRate}%`,
        screenings,
        missedVisits,
        resilienceActivities,
      ]);
    }

    const headers = [
      "Facility Name",
      "LGA",
      "Type",
      "Starlink",
      "Women Enrolled",
      "Total Referrals",
      "Completed Referrals",
      "Open Referrals",
      "Referral Completion Rate",
      "Screenings Logged",
      "Open Missed Visits",
      "Resilience Activities",
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((val) => {
            const str = String(val).replace(/"/g, '""');
            return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
          })
          .join(",")
      ),
    ].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="muryaruwa_phc_performance.csv"',
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
