import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sprout, Filter, Heart, Eye } from "lucide-react";
import { getChildScope, mergeWhere } from "@/lib/permissions";

interface SearchParams {
  type?: string;
  status?: string;
  reason?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function NutritionResiliencePage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Allowed roles
  const allowedRoles = ["ADMIN", "SUPERVISOR", "CHEW", "MIDWIFE", "MOBILIZER"];
  if (!allowedRoles.includes(session.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const type = params.type || "";
  const status = params.status || "";
  const reason = params.reason || "";

  // Build query filters
  const selectedWhere: any = {};
  if (type) selectedWhere.activityType = type;
  if (status) selectedWhere.status = status;
  if (reason) selectedWhere.eligibilityReason = reason;
  if (session.role === "MOBILIZER") selectedWhere.recordedByUserId = session.userId;
  const where = mergeWhere(getChildScope(session), selectedWhere);

  // Query activities
  const activities = await prisma.nutritionResilienceActivity.findMany({
    where,
    include: {
      woman: {
        include: {
          facility: true,
          lga: true,
        },
      },
      recordedBy: {
        select: { fullName: true },
      },
    },
    orderBy: { activityDate: "desc" },
  });

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "COMPLETED":
      case "ATTENDED":
      case "RECEIVED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "PLANNED":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "REFERRED":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "MISSED":
      default:
        return "bg-red-50 text-red-700 border border-red-200";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="section-kicker">Maternal nutrition support</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Nutrition Resilience Tracker</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Track practical nutrition support for vulnerable women, including Tom Brown demonstrations, MUAC follow-up, seedling support, and nutrition groups.
        </p>
      </div>

      {/* Filters form */}
      <div className="p-5 surface-card">
        <form method="GET" action="/nutrition-resilience" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold uppercase tracking-wider">Activity Type</label>
            <select
              name="type"
              defaultValue={type}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
            >
              <option value="">All Activities</option>
              <option value="TOM_BROWN_DEMO">Tom Brown Demonstration</option>
              <option value="LOCAL_FOOD_DEMO">Local Food Demonstration</option>
              <option value="MUAC_FOLLOWUP">Outreach MUAC Recheck</option>
              <option value="SEEDLING_SUPPORT">Seedling Support pack</option>
              <option value="SACK_GARDEN_SUPPORT">Sack Garden setup support</option>
              <option value="NUTRITION_GROUP">Nutrition Resilience Group link</option>
              <option value="FSL_REFERRAL">FSL / Protection referral</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold uppercase tracking-wider">Status</label>
            <select
              name="status"
              defaultValue={status}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="PLANNED">Planned</option>
              <option value="ATTENDED">Attended</option>
              <option value="RECEIVED">Received</option>
              <option value="REFERRED">Referred</option>
              <option value="COMPLETED">Completed</option>
              <option value="MISSED">Missed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold uppercase tracking-wider">Eligibility Criteria</label>
            <select
              name="reason"
              defaultValue={reason}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
            >
              <option value="">All Criteria</option>
              <option value="LOW_MUAC">Low MUAC screening</option>
              <option value="PREGNANT">Pregnant mother vulnerability</option>
              <option value="BREASTFEEDING">Breastfeeding mother vulnerability</option>
              <option value="CAREGIVER_OF_SAM_CHILD">Caregiver of child in OTP</option>
              <option value="SC_DISCHARGE_CAREGIVER">Caregiver of child discharged SC</option>
              <option value="HOUSEHOLD_FOOD_INSECURITY">Household food insecurity</option>
              <option value="SUPERVISOR_APPROVED">Supervisor Approved</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 cursor-pointer rounded-md bg-emerald-700 py-2 text-center font-bold text-white transition hover:bg-emerald-800"
            >
              Filter
            </button>
            <a
              href="/nutrition-resilience"
              className="flex cursor-pointer items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-center text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              Reset
            </a>
          </div>
        </form>
      </div>

      {/* Directory Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Facility / LGA</th>
                <th className="px-6 py-4">Activity Type</th>
                <th className="px-6 py-4">Eligibility Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Activity Date</th>
                <th className="px-6 py-4">Recorded By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No resilience activities recorded.
                  </td>
                </tr>
              ) : (
                activities.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 block">
                        {a.woman.fullName || `${a.woman.codedName} (Anonymized)`}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700 font-bold mt-0.5 block">
                        {a.woman.uniqueCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800 block">{a.woman.facility.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{a.woman.lga.name}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {a.activityType.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {a.eligibilityReason.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-pill ${getStatusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(a.activityDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {a.recordedBy.fullName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/women/${a.woman.id}`}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
