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
        safeContactAssessments: {
          orderBy: { assessedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { registrationDate: "desc" },
    });

    const headers = [
      "Muryar Uwa ID",
      "Name/Code",
      "LGA",
      "Facility",
      "Safe Contact Status",
      "Owns Phone",
      "Shared Phone",
      "Shared With",
      "Safe for Calls",
      "Safe for SMS",
      "Safe for WhatsApp",
      "Preferred Time",
      "Neutral Messages Only",
      "Unsafe Topics",
      "Mobilizer Follow-up Preferred",
      "Direct Contact Allowed",
      "Assessment Date",
    ];

    const rows = women.map((w) => {
      const a = w.safeContactAssessments[0];
      return [
        w.uniqueCode,
        w.fullName || w.codedName || "",
        w.lga.name,
        w.facility.name,
        w.safeContactStatus,
        a ? (a.ownsPhone ? "Yes" : "No") : "",
        a ? (a.sharedPhone ? "Yes" : "No") : "",
        a?.sharedWith || "",
        a ? (a.safeForCalls ? "Yes" : "No") : "",
        a ? (a.safeForSms ? "Yes" : "No") : "",
        a ? (a.safeForWhatsapp ? "Yes" : "No") : "",
        a?.preferredTime || "",
        a ? (a.neutralMessagesOnly ? "Yes" : "No") : "",
        a?.unsafeTopics || "",
        a ? (a.mobilizerFollowUpPreferred ? "Yes" : "No") : "",
        a ? (a.directContactAllowed ? "Yes" : "No") : "",
        a ? a.assessedAt.toISOString() : "",
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
        "Content-Disposition": 'attachment; filename="muryaruwa_safe_contact.csv"',
      },
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
