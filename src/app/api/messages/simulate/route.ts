import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ROLES, getChildScope, mergeWhere } from "@/lib/permissions";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Only admins can run message delivery simulation" }, { status: 403 });
    }

    // Get all pending messages
    const pendingLogs = await prisma.messageLog.findMany({
      where: mergeWhere(getChildScope(session), { deliveryStatus: "PENDING" }),
      include: { woman: true },
    });

    let processedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const log of pendingLogs) {
        const { safeContactStatus, preferredChannel } = log.woman;

        let newStatus = "DELIVERED";
        let newResponse: string | null = null;
        let sentAt: Date | null = new Date();

        // 1. Enforce safety checks in simulation
        if (safeContactStatus === "OPTED_OUT") {
          newStatus = "SKIPPED_UNSAFE";
          sentAt = null;
        } else if (safeContactStatus === "NO_DIRECT_CONTACT" || safeContactStatus === "MOBILIZER_ONLY") {
          newStatus = "MOBILIZER_ASSIGNED";
          sentAt = null;

          // Auto trigger missed visit outreach
          await tx.missedVisit.create({
            data: {
              womanId: log.womanId,
              visitType: "REFERRAL_APPOINTMENT",
              expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              status: "OPEN",
              reasonForMissedVisit: `Phone unsafe (${safeContactStatus}). Scheduled mobilizer tracing.`,
            },
          });
        } else {
          // 2. Normal dispatch simulation (85% success, 15% fail)
          const roll = Math.random();
          if (roll < 0.15) {
            newStatus = "FAILED";
          } else {
            newStatus = "DELIVERED";
            // Randomize responses for delivered messages
            const respRoll = Math.random();
            if (respRoll < 0.5) {
              newResponse = "NO_RESPONSE";
            } else if (respRoll < 0.75) {
              newResponse = "CONFIRMED";
            } else if (respRoll < 0.9) {
              newResponse = "CALLBACK_REQUESTED";
            } else {
              newResponse = "HELP_NEEDED";
            }
          }
        }

        await tx.messageLog.update({
          where: { id: log.id },
          data: {
            deliveryStatus: newStatus,
            responseStatus: newResponse,
            sentAt,
          },
        });

        processedCount++;
      }
    });

    return NextResponse.json({ success: true, processedCount });
  } catch (error: any) {
    console.error("Simulation API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
