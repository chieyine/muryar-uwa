import React from "react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Users,
  CheckCircle,
  ClipboardList,
  AlertCircle,
  TrendingDown,
  Sprout,
  Flame,
  ShieldAlert
} from "lucide-react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import BornoMapWidget from "@/components/BornoMapWidget";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import MetricCard from "@/components/dashboard/MetricCard";
import { getChildScope, getFacilityScope, getWomanScope, mergeWhere } from "@/lib/permissions";

interface PageProps {
  searchParams: Promise<{
    lgaId?: string;
    facilityId?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { lgaId: requestedLgaId, facilityId: requestedFacilityId } = await searchParams;
  const canUseLgaFilter = ["ADMIN", "PHC_BOARD_VIEWER"].includes(session.role);
  const canUseFacilityFilter = ["ADMIN", "SUPERVISOR", "PHC_BOARD_VIEWER"].includes(session.role);
  const lgaId = canUseLgaFilter ? requestedLgaId : undefined;
  const facilityId = canUseFacilityFilter ? requestedFacilityId : undefined;

  const roleWomanScope = getWomanScope(session);
  const roleChildScope = getChildScope(session);

  // Build filter queries
  const selectedWomanFilter: any = {};
  if (lgaId) selectedWomanFilter.lgaId = lgaId;
  if (facilityId) selectedWomanFilter.facilityId = facilityId;

  const selectedChildFilter: any = {};
  if (lgaId || facilityId) {
    selectedChildFilter.woman = {};
    if (lgaId) selectedChildFilter.woman.lgaId = lgaId;
    if (facilityId) selectedChildFilter.woman.facilityId = facilityId;
  }

  const womanFilter = mergeWhere(roleWomanScope, selectedWomanFilter);
  const childFilter = mergeWhere(roleChildScope, selectedChildFilter);

  // Fetch filter options
  const lgas = await prisma.lGA.findMany({
    where: session.role === "SUPERVISOR" && session.lgaId ? { id: session.lgaId } : {},
    orderBy: { name: "asc" },
  });
  const facilities = await prisma.facility.findMany({
    where: mergeWhere(getFacilityScope(session), lgaId ? { lgaId } : {}),
    orderBy: { name: "asc" },
  });

  const serializedLgas = lgas.map((l) => ({ id: l.id, name: l.name }));
  const serializedFacilities = facilities.map((f) => ({
    id: f.id,
    name: f.name,
    lgaId: f.lgaId,
  }));

  // Calculate stats
  const totalWomenEnrolled = await prisma.woman.count({ where: womanFilter });
  const activeDigitalUsers = await prisma.woman.count({
    where: { ...womanFilter, status: "ACTIVE" },
  });

  // Safe Contact assessments completed
  const safeContactCompleted = await prisma.safeContactAssessment.count({
    where: childFilter,
  });
  const safeContactRate = totalWomenEnrolled > 0 
    ? Math.round((safeContactCompleted / totalWomenEnrolled) * 100) 
    : 0;

  // Referrals
  const totalReferrals = await prisma.referral.count({ where: childFilter });
  const openReferrals = await prisma.referral.count({
    where: { ...childFilter, status: { notIn: ["COMPLETED", "CLOSED"] } },
  });
  const completedReferrals = await prisma.referral.count({
    where: { ...childFilter, status: "COMPLETED" },
  });
  const referralCompletionRate = totalReferrals > 0 
    ? Math.round((completedReferrals / totalReferrals) * 100) 
    : 0;

  // Missed Visits
  const missedVisitsCount = await prisma.missedVisit.count({
    where: { ...childFilter, status: "OPEN" },
  });

  // Nutrition Resilience
  const tomBrownDemos = await prisma.nutritionResilienceActivity.count({
    where: { ...childFilter, activityType: "TOM_BROWN_DEMO", status: "COMPLETED" },
  });
  const seedlingSupport = await prisma.nutritionResilienceActivity.count({
    where: {
      ...childFilter,
      activityType: { in: ["SEEDLING_SUPPORT", "SACK_GARDEN_SUPPORT"] },
      status: { in: ["RECEIVED", "COMPLETED"] },
    },
  });

  // Safeguarding & Critical Concern Flags
  const criticalFlagsCount = await prisma.complaintOrSafeguardingFlag.count({
    where: { ...childFilter, severity: "CRITICAL", status: "OPEN" },
  });
  const totalFlagsCount = await prisma.complaintOrSafeguardingFlag.count({
    where: { ...childFilter, status: "OPEN" },
  });

  // Fetch Chart Data
  // 1. Enrolments by Facility
  const allFacilities = await prisma.facility.findMany({
    where: mergeWhere(getFacilityScope(session), lgaId ? { lgaId } : {}),
    include: { _count: { select: { women: true } } },
  });
  const phcEnrolmentsData = allFacilities.map((f) => ({
    name: f.name.replace(" PHC", ""),
    count: f._count.women,
  }));

  // 2. Referrals status breakdown
  const refBreakdown = await prisma.referral.groupBy({
    by: ["status"],
    where: childFilter,
    _count: { id: true },
  });
  const referralStatusData = refBreakdown.map((r) => ({
    name: r.status.replace("_", " "),
    count: r._count.id,
  }));

  // 3. Nutrition risk levels (latest screening per woman)
  // Since SQL group-by for latest record in SQLite is slightly complex in raw sql, 
  // we can fetch the counts of the screening riskCategory directly for simplicity in the demo.
  const riskBreakdown = await prisma.nutritionScreening.groupBy({
    by: ["riskCategory"],
    where: childFilter,
    _count: { id: true },
  });
  const nutritionRiskData = riskBreakdown.map((r) => ({
    name: r.riskCategory.replace("_", " "),
    count: r._count.id,
  }));

  // 4. Communication channel breakdown
  const channelBreakdown = await prisma.woman.groupBy({
    by: ["preferredChannel"],
    where: womanFilter,
    _count: { id: true },
  });
  const channelDistributionData = channelBreakdown.map((c) => ({
    name: c.preferredChannel.replace("_", " "),
    count: c._count.id,
  }));

  // 5. Preferred language breakdown
  const langBreakdown = await prisma.woman.groupBy({
    by: ["preferredLanguage"],
    where: womanFilter,
    _count: { id: true },
  });
  const languageDistributionData = langBreakdown.map((l) => ({
    name: l.preferredLanguage,
    count: l._count.id,
  }));

  // 6. Safe contact status category breakdown
  const safeContactBreakdown = await prisma.woman.groupBy({
    by: ["safeContactStatus"],
    where: womanFilter,
    _count: { id: true },
  });
  const safeContactCategoryData = safeContactBreakdown.map((s) => ({
    name: s.safeContactStatus.replace("_", " "),
    count: s._count.id,
  }));

  // 7. Open referrals by type
  const openRefByType = await prisma.referral.groupBy({
    by: ["referralType"],
    where: { ...childFilter, status: { notIn: ["COMPLETED", "CLOSED"] } },
    _count: { id: true },
  });
  const openReferralsByTypeData = openRefByType.map((r) => ({
    name: r.referralType.replace("_", " "),
    count: r._count.id,
  }));

  // 8. Low MUAC women count (MUAC < 23)
  const lowMuacWomen = await prisma.nutritionScreening.count({
    where: { ...childFilter, muacCm: { lt: 23.0 } },
  });

  // Query LGA metrics for visual BornoMapWidget
  const showMap = ["ADMIN", "SUPERVISOR", "PHC_BOARD_VIEWER"].includes(session.role);
  let mapLgaData: any[] = [];
  if (showMap) {
    mapLgaData = await Promise.all(
      lgas.map(async (lga) => {
        const count = await prisma.woman.count({ where: mergeWhere(roleWomanScope, { lgaId: lga.id }) });
        const openReferrals = await prisma.referral.count({
          where: mergeWhere(roleChildScope, {
            woman: { lgaId: lga.id },
            status: { notIn: ["COMPLETED", "CLOSED"] },
          }),
        });
        const lowMuacAlerts = await prisma.nutritionScreening.count({
          where: mergeWhere(roleChildScope, {
            woman: { lgaId: lga.id },
            muacCm: { lt: 23.0 },
          }),
        });

        return {
          id: lga.id,
          name: lga.name,
          count,
          openReferrals,
          lowMuacAlerts,
        };
      })
    );
  }

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page Title & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <p className="section-kicker">Operations overview</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Muryar Uwa Dashboard</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Maternal nutrition follow-up, safe contact, referrals, and PHC performance across active demo facilities.
          </p>
        </div>

        {/* Filters Form */}
        <DashboardFilters
          lgas={serializedLgas}
          facilities={serializedFacilities}
          selectedLgaId={lgaId || ""}
          selectedFacilityId={facilityId || ""}
          currentUserRole={session.role}
        />
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Women enrolled"
          value={totalWomenEnrolled}
          icon={Users}
          tone="green"
          detail={<>Active follow-up profiles: <span className="font-bold text-slate-700">{activeDigitalUsers}</span></>}
        />
        <MetricCard
          label="Safe contact"
          value={`${safeContactRate}%`}
          icon={CheckCircle}
          tone="green"
          detail={<>Assessments completed: <span className="font-bold text-slate-700">{safeContactCompleted}</span></>}
        />
        <MetricCard
          label="Referral success"
          value={`${referralCompletionRate}%`}
          icon={ClipboardList}
          tone="blue"
          detail={<>Open referrals: <span className="font-bold text-slate-700">{openReferrals}</span></>}
        />
        <MetricCard
          label="Missed visits"
          value={missedVisitsCount}
          icon={AlertCircle}
          tone="amber"
          detail="Awaiting tracing or outreach action"
        />
        <MetricCard
          label="Low MUAC"
          value={lowMuacWomen}
          icon={TrendingDown}
          tone="red"
          detail="Screenings below 23 cm threshold"
        />
      </div>

      {/* Row 2: Secondary Metrics (Tom Brown, Sack Garden, Safeguarding Flags) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="surface-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="section-kicker">Nutrition sessions</p>
              <p className="text-xl font-bold text-slate-950">{tomBrownDemos}</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500">Tom Brown demonstrations marked completed.</p>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <p className="section-kicker">Resilience support</p>
              <p className="text-xl font-bold text-slate-950">{seedlingSupport}</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-500">Seedling and sack-garden support received.</p>
        </div>

        <div className={`rounded-lg border p-5 shadow-sm ${totalFlagsCount > 0 ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${totalFlagsCount > 0 ? "border-red-200 bg-white text-red-700" : "border-slate-200 bg-slate-100 text-slate-600"}`}>
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="section-kicker">Safeguarding</p>
              <p className="text-xl font-bold text-slate-950">{totalFlagsCount}</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-600">{criticalFlagsCount} critical flags currently active.</p>
        </div>
      </div>

      {/* Interactive LGA Map Widget */}
      {showMap && <BornoMapWidget lgas={mapLgaData} selectedLgaId={lgaId} />}

      {/* Main Charts Block */}
      <DashboardCharts
        phcEnrolments={phcEnrolmentsData}
        referralStatus={referralStatusData}
        nutritionRisk={nutritionRiskData}
        channelDistribution={channelDistributionData}
        languageDistribution={languageDistributionData}
        safeContactCategory={safeContactCategoryData}
        openReferralsByType={openReferralsByTypeData}
      />
    </div>
  );
}
