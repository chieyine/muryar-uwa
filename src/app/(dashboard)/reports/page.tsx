import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  FileSpreadsheet,
  Download,
  Users,
  ClipboardList,
  Activity,
  Sprout,
  ShieldCheck,
  ArrowRight,
  MapPin,
  AlertTriangle,
  Shield,
  Lock
} from "lucide-react";
import { canExportIdentifiedReports, getChildScope, getFacilityScope, getWomanScope } from "@/lib/permissions";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Only Admin, Supervisor, and PHC Board Viewer can access reports
  const allowedRoles = ["ADMIN", "SUPERVISOR", "PHC_BOARD_VIEWER"];
  if (!allowedRoles.includes(session.role)) {
    redirect("/dashboard");
  }

  const womanScope = getWomanScope(session);
  const childScope = getChildScope(session);
  const canExportIdentified = canExportIdentifiedReports(session.role);
  const identifiedDownloadClass = canExportIdentified
    ? "cursor-pointer"
    : "pointer-events-none cursor-not-allowed opacity-55 grayscale";

  // Fetch counts
  const enrolmentCount = await prisma.woman.count({ where: womanScope });
  const referralCount = await prisma.referral.count({ where: childScope });
  const screeningCount = await prisma.nutritionScreening.count({ where: childScope });
  const activityCount = await prisma.nutritionResilienceActivity.count({ where: childScope });
  const safeContactCount = await prisma.safeContactAssessment.count({ where: childScope });
  const facilityCount = await prisma.facility.count({ where: getFacilityScope(session) });
  const missedVisitCount = await prisma.missedVisit.count({ where: childScope });

  // Fetch previews (latest 3 of each)
  const latestEnrolments = await prisma.woman.findMany({
    where: womanScope,
    take: 3,
    include: { facility: true },
    orderBy: { registrationDate: "desc" },
  });

  const latestReferrals = await prisma.referral.findMany({
    where: childScope,
    take: 3,
    include: { woman: true },
    orderBy: { createdAt: "desc" },
  });

  const latestScreenings = await prisma.nutritionScreening.findMany({
    where: childScope,
    take: 3,
    include: { woman: true },
    orderBy: { screenedAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-fade-in text-xs md:text-sm">
      {/* Header */}
      <div>
        <p className="section-kicker">Evidence and accountability</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Reports & Data Exports</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Download clean monitoring reports for enrolment, referrals, safe contact, nutrition screening, PHC performance, and community follow-up.
        </p>
        {!canExportIdentified && (
          <div className="mt-4 inline-flex max-w-3xl items-start gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-900">
            <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-700" />
            <span>Privacy mode is active for this role. Identified participant exports and live case previews are restricted; aggregate PHC performance remains available.</span>
          </div>
        )}
      </div>

      {/* Reports Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enrolments Report */}
        <div className="p-6 surface-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Enrolment Summary Report</h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{enrolmentCount} total records</span>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Export comprehensive details of enrolled participants, including demographic profiles, community settlements, preferred communication channels, safe contact assessments, and registrar staff IDs.
            </p>
          </div>
          
          <a
            href={canExportIdentified ? "/api/reports/enrolment.csv" : undefined}
            aria-disabled={!canExportIdentified}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-emerald-50 hover:bg-emerald-500/15 border border-emerald-200 text-emerald-700 font-bold transition-all text-xs text-center ${identifiedDownloadClass}`}
          >
            <Download className="w-4 h-4" />
            Download Enrolments CSV
          </a>
        </div>

        {/* Referrals Report */}
        <div className="p-6 surface-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Referrals Success Report</h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{referralCount} total records</span>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Export tracking summaries for all medical and nutrition referrals. Includes type details (ANC, PNC, OTP), priority, current status (Attended, Completed, Escalated), destinations, assigned staff, and completion dates.
            </p>
          </div>
          
          <a
            href={canExportIdentified ? "/api/reports/referrals.csv" : undefined}
            aria-disabled={!canExportIdentified}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-blue-50 hover:bg-blue-500/15 border border-blue-200 text-blue-700 font-bold transition-all text-xs text-center ${identifiedDownloadClass}`}
          >
            <Download className="w-4 h-4" />
            Download Referrals CSV
          </a>
        </div>

        {/* Nutrition Screening Report */}
        <div className="p-6 surface-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Nutrition Screening Report</h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{screeningCount} total records</span>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Export nutrition screening logs containing Mid-Upper Arm Circumference (MUAC) measurements, pitting oedema details, visible wasting observations, appetite concerns, food security indicators, and classified risk levels.
            </p>
          </div>
          
          <a
            href={canExportIdentified ? "/api/reports/nutrition.csv" : undefined}
            aria-disabled={!canExportIdentified}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-amber-50 hover:bg-amber-500/15 border border-amber-200 text-amber-700 font-bold transition-all text-xs text-center ${identifiedDownloadClass}`}
          >
            <Download className="w-4 h-4" />
            Download Screenings CSV
          </a>
        </div>

        {/* Resilience Activities Report */}
        <div className="p-6 surface-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Resilience Activity Report</h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{activityCount} total records</span>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Export community food resilience session details, tracking seedling distribution, sack-garden setup support, Tom Brown nutritional demonstrations attended, maternal nutrition group linkages, and FSL referrals.
            </p>
          </div>
          
          <a
            href={canExportIdentified ? "/api/reports/activities.csv" : undefined}
            aria-disabled={!canExportIdentified}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-bold transition-all text-xs text-center ${identifiedDownloadClass}`}
          >
            <Download className="w-4 h-4" />
            Download Activities CSV
          </a>
        </div>

        {/* Safe Contact Report */}
        <div className="p-6 surface-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Safe Contact Summary Report</h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{safeContactCount} assessments logged</span>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Export safe contact assessment history: phone ownership, shared phone risk factors, messaging safety settings, neutral message preferences, and mobilizer follow-up recommendations.
            </p>
          </div>
          
          <a
            href={canExportIdentified ? "/api/reports/safe-contact.csv" : undefined}
            aria-disabled={!canExportIdentified}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-purple-50 hover:bg-purple-500/15 border border-purple-200 text-purple-700 font-bold transition-all text-xs text-center ${identifiedDownloadClass}`}
          >
            <Download className="w-4 h-4" />
            Download Safe Contact CSV
          </a>
        </div>

        {/* PHC Performance Report */}
        <div className="p-6 surface-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">PHC Performance Report</h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{facilityCount} facilities tracked</span>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Export facility-level performance metrics: enrolment counts, referral completion rates, open vs closed referrals, screenings, missed visits, and resilience support across all PHCs.
            </p>
          </div>
          
          <a
            href="/api/reports/phc-performance.csv"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-cyan-50 hover:bg-cyan-500/15 border border-cyan-200 text-cyan-700 font-bold transition-all text-xs cursor-pointer text-center"
          >
            <Download className="w-4 h-4" />
            Download PHC Performance CSV
          </a>
        </div>

        {/* Missed Visit Tracing Report */}
        <div className="p-6 surface-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Missed Visit Tracing Report</h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{missedVisitCount} total visits tracked</span>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Export all missed appointment records with overdue days calculations, mobilizer assignment details, outreach outcome notes, and resolution status.
            </p>
          </div>
          
          <a
            href={canExportIdentified ? "/api/reports/missed-visits.csv" : undefined}
            aria-disabled={!canExportIdentified}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-rose-50 hover:bg-rose-500/15 border border-rose-200 text-rose-700 font-bold transition-all text-xs text-center ${identifiedDownloadClass}`}
          >
            <Download className="w-4 h-4" />
            Download Missed Visits CSV
          </a>
        </div>
      </div>

      {/* Data Feed Live Previews */}
      {canExportIdentified && <div className="space-y-5">
        <h3 className="text-base font-bold text-slate-800">Live Data Feed Previews</h3>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Previews: Enrolments */}
          <div className="p-5 surface-card bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Latest Enrolments</span>
            
            <div className="space-y-2 text-xs">
              {latestEnrolments.map((e) => (
                <div key={e.id} className="p-3 rounded-md bg-white border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800 block">{e.fullName || e.codedName}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{e.facility.name}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-[10px]">{e.uniqueCode}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Previews: Referrals */}
          <div className="p-5 surface-card bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Latest Referrals</span>
            
            <div className="space-y-2 text-xs">
              {latestReferrals.map((r) => (
                <div key={r.id} className="p-3 rounded-md bg-white border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800 block">{r.referralType.replace("_", " ")}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{r.woman.fullName || r.woman.codedName}</span>
                  </div>
                  <span className="status-pill bg-blue-50 text-blue-700 text-[9px] py-0.5">{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Previews: Screenings */}
          <div className="p-5 surface-card bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Latest Screenings</span>
            
            <div className="space-y-2 text-xs">
              {latestScreenings.map((s) => (
                <div key={s.id} className="p-3 rounded-md bg-white border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800 block">{s.woman.fullName || s.woman.codedName}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">MUAC: {s.muacCm ? `${s.muacCm} cm` : "Oedema"}</span>
                  </div>
                  <span className="status-pill bg-amber-50 text-amber-700 text-[9px] py-0.5">{s.riskCategory.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
