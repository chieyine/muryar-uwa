import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ReferralsClient from "./ReferralsClient";
import { getChildScope, getFacilityScope, mergeWhere } from "@/lib/permissions";
import { minimizeParticipantForUser } from "@/lib/privacy";

interface SearchParams {
  type?: string;
  priority?: string;
  status?: string;
  assignedToId?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ReferralsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Allowed roles for referral tracker
  const allowedRoles = ["ADMIN", "SUPERVISOR", "CHEW", "MIDWIFE", "MOBILIZER"];
  if (!allowedRoles.includes(session.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const type = params.type || "";
  const priority = params.priority || "";
  const status = params.status || "";
  const assignedToId = params.assignedToId || "";

  // Build query filters
  const selectedWhere: any = {};
  if (type) selectedWhere.referralType = type;
  if (priority) selectedWhere.priority = priority;
  if (status) selectedWhere.status = status;
  if (assignedToId) selectedWhere.assignedToUserId = assignedToId;
  if (session.role === "MOBILIZER") selectedWhere.assignedToUserId = session.userId;
  const where = mergeWhere(getChildScope(session), selectedWhere);

  // Query all matching referrals
  const referrals = (await prisma.referral.findMany({
    where,
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
      updates: {
        include: {
          updatedBy: { select: { fullName: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })).map((referral) => ({
    ...referral,
    woman: minimizeParticipantForUser(referral.woman, session),
  }));

  // Fetch staff list for assignee filter and dropdown
  const staff = await prisma.user.findMany({
    where: mergeWhere(
      { isActive: true },
      session.role === "SUPERVISOR" && session.lgaId ? { lgaId: session.lgaId } : {},
      ["CHEW", "MIDWIFE"].includes(session.role) && session.facilityId ? { facilityId: session.facilityId } : {},
      session.role === "MOBILIZER" ? { id: session.userId } : {}
    ),
    select: {
      id: true,
      fullName: true,
      role: true,
    },
    orderBy: { fullName: "asc" },
  });

  // LGAs and facilities for filtering details
  const lgas = await prisma.lGA.findMany({
    where: session.role === "ADMIN" ? {} : session.lgaId ? { id: session.lgaId } : { id: "__deny_all__" },
    orderBy: { name: "asc" },
  });
  const facilities = await prisma.facility.findMany({
    where: getFacilityScope(session),
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Care completion</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Referral Tracker</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Monitor maternal care, nutrition concern, and community follow-up referrals until they are completed or escalated.
        </p>
      </div>

      <ReferralsClient
        referrals={referrals}
        staff={staff}
        lgas={lgas.map(l => ({ id: l.id, name: l.name }))}
        facilities={facilities.map(f => ({ id: f.id, name: f.name }))}
        currentUser={{ id: session.userId, role: session.role }}
        searchParams={params}
      />
    </div>
  );
}
