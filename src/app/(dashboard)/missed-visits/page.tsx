import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import MissedVisitsClient from "./MissedVisitsClient";
import { canAssignOutreach, getChildScope, mergeWhere } from "@/lib/permissions";
import { minimizeParticipantForUser } from "@/lib/privacy";

export default async function MissedVisitsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Allowed roles
  const allowedRoles = ["ADMIN", "SUPERVISOR", "CHEW", "MIDWIFE", "MOBILIZER"];
  if (!allowedRoles.includes(session.role)) {
    redirect("/dashboard");
  }

  // Query all missed visits
  const missedVisits = (await prisma.missedVisit.findMany({
    where: mergeWhere(
      getChildScope(session),
      session.role === "MOBILIZER" ? { assignedToUserId: session.userId } : {}
    ),
    include: {
      woman: {
        include: {
          facility: true,
          lga: true,
        },
      },
      assignedTo: {
        select: { id: true, fullName: true },
      },
    },
    orderBy: { expectedDate: "desc" },
  })).map((visit) => ({
    ...visit,
    woman: minimizeParticipantForUser(visit.woman, session),
  }));

  // Query mobilizers list for assignment dropdown
  const mobilizers = await prisma.user.findMany({
    where: mergeWhere(
      { role: "MOBILIZER", isActive: true },
      session.role === "SUPERVISOR" && session.lgaId ? { lgaId: session.lgaId } : {},
      canAssignOutreach(session.role) ? {} : { id: session.userId }
    ),
    select: {
      id: true,
      fullName: true,
      role: true,
    },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Missed Visit Tracing</h2>
        <p className="text-sm text-slate-600">
          Trace missed health appointments and assign field mobilizers for household follow-up outreach.
        </p>
      </div>

      <MissedVisitsClient
        missedVisits={missedVisits}
        mobilizers={mobilizers}
        currentUser={{ id: session.userId, role: session.role }}
      />
    </div>
  );
}
