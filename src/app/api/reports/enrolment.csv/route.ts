import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canExportIdentifiedReports, getWomanScope } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!canExportIdentifiedReports(session.role)) {
      return new Response("Forbidden", { status: 403 });
    }

    const women = await prisma.woman.findMany({
      where: getWomanScope(session),
      include: {
        facility: true,
        lga: true,
      },
      orderBy: { registrationDate: "desc" },
    });

    const headers = [
      "Muryar Uwa ID",
      "Coded Name",
      "Full Name",
      "Age",
      "LGA",
      "Facility",
      "Community",
      "Pregnancy Status",
      "Breastfeeding Status",
      "Safe Contact Status",
      "Preferred Language",
      "Preferred Channel",
      "Registration Date",
    ];

    const rows = women.map((w) => [
      w.uniqueCode,
      w.codedName || "",
      w.fullName || "",
      w.age,
      w.lga.name,
      w.facility.name,
      w.community,
      w.pregnancyStatus,
      w.breastfeedingStatus,
      w.safeContactStatus,
      w.preferredLanguage,
      w.preferredChannel,
      w.registrationDate.toISOString(),
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
        "Content-Disposition": 'attachment; filename="muryaruwa_enrolments.csv"',
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
