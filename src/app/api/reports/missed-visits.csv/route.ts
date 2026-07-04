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

    const missedVisits = await prisma.missedVisit.findMany({
      where: getChildScope(session),
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

    const headers = [
      "Visit ID",
      "Muryar Uwa ID",
      "Participant Name/Code",
      "LGA",
      "Facility",
      "Visit Type",
      "Expected Date",
      "Days Overdue",
      "Status",
      "Assigned Mobilizer",
      "Reason/Notes",
      "Created At",
    ];

    const rows = missedVisits.map((v) => {
      const diffTime = Date.now() - new Date(v.expectedDate).getTime();
      const overdueDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      return [
        v.id,
        v.woman.uniqueCode,
        v.woman.fullName || v.woman.codedName || "",
        v.woman.lga.name,
        v.woman.facility.name,
        v.visitType,
        v.expectedDate.toISOString(),
        overdueDays,
        v.status,
        v.assignedTo?.fullName || "Unassigned",
        v.reasonForMissedVisit || "",
        v.createdAt.toISOString(),
      ];
    });

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
        "Content-Disposition": 'attachment; filename="muryaruwa_missed_visits.csv"',
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
