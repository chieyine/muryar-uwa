import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canExportIdentifiedReports, getChildScope } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!canExportIdentifiedReports(session.role)) {
      return new Response("Forbidden", { status: 403 });
    }

    const activities = await prisma.nutritionResilienceActivity.findMany({
      where: getChildScope(session),
      include: {
        woman: {
          include: {
            facility: true,
            lga: true,
          },
        },
      },
      orderBy: { activityDate: "desc" },
    });

    const headers = [
      "Activity ID",
      "Muryar Uwa ID",
      "Participant Name/Code",
      "LGA",
      "Facility",
      "Activity Type",
      "Eligibility Reason",
      "Status",
      "Activity Date",
      "Notes",
    ];

    const rows = activities.map((a) => [
      a.id,
      a.woman.uniqueCode,
      a.woman.fullName || a.woman.codedName || "",
      a.woman.lga.name,
      a.woman.facility.name,
      a.activityType,
      a.eligibilityReason,
      a.status,
      a.activityDate.toISOString(),
      a.notes || "",
    ]);

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
        "Content-Disposition": 'attachment; filename="muryaruwa_resilience_activities.csv"',
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
