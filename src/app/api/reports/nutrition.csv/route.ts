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

    const screenings = await prisma.nutritionScreening.findMany({
      where: getChildScope(session),
      include: {
        woman: {
          include: {
            facility: true,
            lga: true,
          },
        },
      },
      orderBy: { screenedAt: "desc" },
    });

    const headers = [
      "Screening ID",
      "Muryar Uwa ID",
      "Participant Name/Code",
      "LGA",
      "Facility",
      "MUAC (cm)",
      "Oedema",
      "Visibly Wasted",
      "Appetite Concern",
      "Food Insecurity",
      "Risk Category",
      "Screening Date",
    ];

    const rows = screenings.map((s) => [
      s.id,
      s.woman.uniqueCode,
      s.woman.fullName || s.woman.codedName || "",
      s.woman.lga.name,
      s.woman.facility.name,
      s.muacCm || "",
      s.oedema ? "Yes" : "No",
      s.visiblyWasted ? "Yes" : "No",
      s.appetiteConcern ? "Yes" : "No",
      s.householdFoodInsecurity ? "Yes" : "No",
      s.riskCategory,
      s.screenedAt.toISOString(),
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
        "Content-Disposition": 'attachment; filename="muryaruwa_nutrition_screenings.csv"',
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
