import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import WomanProfileClient from "./WomanProfileClient";
import { canAssignOutreach, canViewParticipantDirectory, getUserCapabilities, getWomanScope, mergeWhere } from "@/lib/permissions";
import { minimizeParticipantForUser } from "@/lib/privacy";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WomanProfilePage({ params }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!canViewParticipantDirectory(session.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;

  // Query woman profile with full nested logs
  const woman = await prisma.woman.findFirst({
    where: mergeWhere({ id }, getWomanScope(session)),
    include: {
      facility: true,
      lga: true,
      safeContactAssessments: {
        orderBy: { assessedAt: "desc" },
      },
      nutritionScreenings: {
        orderBy: { screenedAt: "desc" },
      },
      referrals: {
        include: {
          assignedTo: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      messageLogs: {
        include: {
          template: { select: { title: true } },
        },
        orderBy: { scheduledAt: "desc" },
      },
      resilienceActivities: {
        orderBy: { activityDate: "desc" },
      },
      missedVisits: {
        include: {
          assignedTo: { select: { fullName: true } },
        },
        orderBy: { expectedDate: "desc" },
      },
      complaints: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!woman) {
    notFound();
  }

  // Fetch staff list for referral assignment dropdown
  const staff = await prisma.user.findMany({
    where: mergeWhere(
      { isActive: true },
      session.role === "SUPERVISOR" && session.lgaId ? { lgaId: session.lgaId } : {},
      ["CHEW", "MIDWIFE"].includes(session.role) && session.facilityId ? { facilityId: session.facilityId } : {},
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
      {/* Back to list Link */}
      <div>
        <Link
          href="/women"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Directory
        </Link>
      </div>

      <WomanProfileClient
        woman={minimizeParticipantForUser(woman, session)}
        staff={staff}
        currentUserRole={session.role}
        capabilities={getUserCapabilities(session)}
      />
    </div>
  );
}
