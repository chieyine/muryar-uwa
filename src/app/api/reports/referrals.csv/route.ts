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

    const referrals = await prisma.referral.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Referral ID",
      "Muryar Uwa ID",
      "Participant Name/Code",
      "LGA",
      "Facility",
      "Referral Type",
      "Priority",
      "Status",
      "Reason",
      "Destination",
      "Assigned Staff",
      "Due Date",
      "Completed Date",
      "Created Date",
    ];

    const rows = referrals.map((r) => [
      r.id,
      r.woman.uniqueCode,
      r.woman.fullName || r.woman.codedName || "",
      r.woman.lga.name,
      r.woman.facility.name,
      r.referralType,
      r.priority,
      r.status,
      r.reason,
      r.destination || "",
      r.assignedTo?.fullName || "Unassigned",
      r.dueDate ? r.dueDate.toISOString() : "",
      r.completedAt ? r.completedAt.toISOString() : "",
      r.createdAt.toISOString(),
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
        "Content-Disposition": 'attachment; filename="muryaruwa_referrals.csv"',
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
