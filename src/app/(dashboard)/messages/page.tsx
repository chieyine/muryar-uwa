import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";
import { getChildScope } from "@/lib/permissions";
import { minimizeParticipantForUser } from "@/lib/privacy";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch all message templates
  const templates = await prisma.messageTemplate.findMany({
    orderBy: { category: "asc" },
  });

  // Fetch message logs categorized by status
  const logs = (await prisma.messageLog.findMany({
    where: getChildScope(session),
    include: {
      woman: true,
      template: { select: { title: true } },
    },
    orderBy: { scheduledAt: "desc" },
  })).map((log) => ({
    ...log,
    woman: minimizeParticipantForUser(log.woman, session),
  }));

  const scheduledLogs = logs.filter((l) => l.deliveryStatus === "PENDING");
  const sentLogs = logs.filter((l) => ["SENT", "DELIVERED"].includes(l.deliveryStatus));
  const failedLogs = logs.filter((l) => l.deliveryStatus === "FAILED");
  const skippedLogs = logs.filter((l) => l.deliveryStatus === "SKIPPED_UNSAFE");
  const mobilizerLogs = logs.filter((l) => l.deliveryStatus === "MOBILIZER_ASSIGNED");

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Safe communication</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Messages Queue & Logs</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Review approved templates, scheduled reminders, delivery outcomes, and mobilizer follow-up for unsafe contact cases.
        </p>
      </div>

      <MessagesClient
        templates={templates}
        scheduledLogs={scheduledLogs}
        sentLogs={sentLogs}
        failedLogs={failedLogs}
        skippedLogs={skippedLogs}
        mobilizerLogs={mobilizerLogs}
      />
    </div>
  );
}
