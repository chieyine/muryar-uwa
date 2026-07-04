import React from "react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  User,
  Activity,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Languages,
  MessageCircle,
  Eye,
  Lock
} from "lucide-react";
import { canViewParticipantDirectory, getFacilityScope, getWomanScope, mergeWhere } from "@/lib/permissions";
import { minimizeParticipantsForUser } from "@/lib/privacy";

interface SearchParams {
  query?: string;
  lgaId?: string;
  facilityId?: string;
  language?: string;
  channel?: string;
  safeStatus?: string;
  risk?: string;
  pregnancy?: string;
  breastfeeding?: string;
  otp?: string;
  sc?: string;
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function WomenDirectoryPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!canViewParticipantDirectory(session.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const query = params.query || "";
  const canUseLgaFilter = session.role === "ADMIN";
  const canUseFacilityFilter = ["ADMIN", "SUPERVISOR"].includes(session.role);
  const lgaId = canUseLgaFilter ? params.lgaId || "" : "";
  const facilityId = canUseFacilityFilter ? params.facilityId || "" : "";
  const language = params.language || "";
  const channel = params.channel || "";
  const safeStatus = params.safeStatus || "";
  const risk = params.risk || "";
  const pregnancy = params.pregnancy || "";
  const breastfeeding = params.breastfeeding || "";
  const otp = params.otp || "";
  const sc = params.sc || "";
  const page = params.page || "1";

  // Build query filters
  const selectedWhere: any = {};

  if (query) {
    selectedWhere.OR = [
      { fullName: { contains: query } },
      { codedName: { contains: query } },
      { uniqueCode: { contains: query } },
      { phone: { contains: query } },
    ];
  }

  if (lgaId) selectedWhere.lgaId = lgaId;
  if (facilityId) selectedWhere.facilityId = facilityId;
  if (language) selectedWhere.preferredLanguage = language;
  if (channel) selectedWhere.preferredChannel = channel;
  if (safeStatus) selectedWhere.safeContactStatus = safeStatus;
  if (pregnancy) selectedWhere.pregnancyStatus = pregnancy;
  if (breastfeeding) selectedWhere.breastfeedingStatus = breastfeeding;
  if (otp === "true") selectedWhere.childInOtp = true;
  if (sc === "true") selectedWhere.childDischargedFromSc = true;

  if (risk) {
    selectedWhere.nutritionScreenings = {
      some: {
        riskCategory: risk,
      },
    };
  }

  const where = mergeWhere(getWomanScope(session), selectedWhere);

  // Pagination
  const pageSize = 10;
  const pageNum = parseInt(page) || 1;
  const totalCount = await prisma.woman.count({ where });
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const women = minimizeParticipantsForUser(await prisma.woman.findMany({
    where,
    include: {
      facility: true,
      lga: true,
      nutritionScreenings: {
        orderBy: { screenedAt: "desc" },
        take: 1,
      },
      referrals: {
        where: { status: { notIn: ["COMPLETED", "CLOSED"] } },
      },
    },
    orderBy: { registrationDate: "desc" },
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
  }), session);

  // Filter options
  const lgas = await prisma.lGA.findMany({
    where: session.role === "ADMIN" ? {} : session.lgaId ? { id: session.lgaId } : { id: "__deny_all__" },
    orderBy: { name: "asc" },
  });
  const facilities = await prisma.facility.findMany({
    where: mergeWhere(getFacilityScope(session), lgaId ? { lgaId } : {}),
    orderBy: { name: "asc" },
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "URGENT_REFERRAL":
        return <span className="status-pill bg-red-50 text-red-700 border border-red-200">URGENT REF</span>;
      case "SEVERE_CONCERN":
        return <span className="status-pill bg-orange-50 text-orange-700 border border-orange-200">SEVERE</span>;
      case "MODERATE_CONCERN":
        return <span className="status-pill bg-amber-50 text-amber-700 border border-amber-200">MODERATE</span>;
      case "AT_RISK":
        return <span className="status-pill bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">AT RISK</span>;
      case "NORMAL":
        return <span className="status-pill bg-emerald-50 text-emerald-700 border border-emerald-200">NORMAL</span>;
      default:
        return <span className="status-pill bg-slate-100 text-slate-600 border border-slate-200">NO SCREENING</span>;
    }
  };

  const getSafeBadge = (status: string) => {
    switch (status) {
      case "DIRECT_SAFE":
        return <span className="status-pill bg-emerald-50 text-emerald-700 border border-emerald-200">DIRECT SAFE</span>;
      case "NEUTRAL_ONLY":
        return <span className="status-pill bg-blue-50 text-blue-700 border border-blue-200">NEUTRAL ONLY</span>;
      case "MOBILIZER_ONLY":
        return <span className="status-pill bg-amber-50 text-amber-700 border border-amber-200">MOBILIZER ONLY</span>;
      case "NO_DIRECT_CONTACT":
        return <span className="status-pill bg-red-50 text-red-700 border border-red-200">NO PHONE</span>;
      case "OPTED_OUT":
        return <span className="status-pill bg-slate-100 text-slate-600 border border-slate-200">OPTED OUT</span>;
      default:
        return <span className="status-pill bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="section-kicker">Women and caregivers</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Women Directory</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Search enrolled women, review safe contact choices, and identify nutrition or referral follow-up needs.
          </p>
        </div>
        {["ADMIN", "CHEW", "MIDWIFE"].includes(session.role) && (
          <Link
            href="/women/new"
            className="inline-flex cursor-pointer items-center gap-2 self-start rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
          >
            <Plus className="w-4 h-4" />
            Enrol Woman
          </Link>
        )}
      </div>

      {/* Main Grid: Filters & Directory Table */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Filters Panel */}
        <aside className="surface-card space-y-5 p-5 xl:col-span-1">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Filter className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Filters</h3>
          </div>
          {!canUseLgaFilter && !canUseFacilityFilter && (
            <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-700" />
              <span className="font-semibold">Location is locked to your assigned caseload.</span>
            </div>
          )}

          <form method="GET" action="/women" className="space-y-4 text-xs">
            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="block text-slate-600 font-semibold uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="query"
                  defaultValue={query}
                  placeholder="ID, Name, Phone..."
                  className="w-full pl-9 pr-4 py-2.5 glass-input text-slate-950"
                />
              </div>
            </div>

            {canUseLgaFilter && (
              <div className="space-y-1.5">
                <label className="block text-slate-600 font-semibold uppercase tracking-wider">LGA</label>
                <select
                  name="lgaId"
                  defaultValue={lgaId}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
                >
                  <option value="">All LGAs</option>
                  {lgas.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {canUseFacilityFilter && (
              <div className="space-y-1.5">
                <label className="block text-slate-600 font-semibold uppercase tracking-wider">Facility</label>
                <select
                  name="facilityId"
                  defaultValue={facilityId}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
                >
                  <option value="">All Facilities</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Risk Category */}
            <div className="space-y-1.5">
              <label className="block text-slate-600 font-semibold uppercase tracking-wider">Nutrition Risk</label>
              <select
                name="risk"
                defaultValue={risk}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
              >
                <option value="">All Levels</option>
                <option value="NORMAL">Normal</option>
                <option value="AT_RISK">At Risk</option>
                <option value="MODERATE_CONCERN">Moderate Concern</option>
                <option value="SEVERE_CONCERN">Severe Concern</option>
                <option value="URGENT_REFERRAL">Urgent Referral</option>
              </select>
            </div>

            {/* Safe Contact Status */}
            <div className="space-y-1.5">
              <label className="block text-slate-600 font-semibold uppercase tracking-wider">Safe Contact Status</label>
              <select
                name="safeStatus"
                defaultValue={safeStatus}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
              >
                <option value="">All Categories</option>
                <option value="DIRECT_SAFE">Direct Safe</option>
                <option value="NEUTRAL_ONLY">Neutral Only</option>
                <option value="MOBILIZER_ONLY">Mobilizer Only</option>
                <option value="NO_DIRECT_CONTACT">No Phone / Contact</option>
                <option value="OPTED_OUT">Opted Out</option>
              </select>
            </div>

            {/* Preferred Language */}
            <div className="space-y-1.5">
              <label className="block text-slate-600 font-semibold uppercase tracking-wider">Language</label>
              <select
                name="language"
                defaultValue={language}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
              >
                <option value="">All Languages</option>
                <option value="HAUSA">Hausa</option>
                <option value="KANURI">Kanuri</option>
                <option value="FULFULDE">Fulfulde</option>
                <option value="ENGLISH">English</option>
              </select>
            </div>

            {/* Boolean flags */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-950">
                <input
                  type="checkbox"
                  name="otp"
                  value="true"
                  defaultChecked={otp === "true"}
                  className="rounded bg-white border-slate-200 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span>Child in OTP</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-950">
                <input
                  type="checkbox"
                  name="sc"
                  value="true"
                  defaultChecked={sc === "true"}
                  className="rounded bg-white border-slate-200 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span>Child discharged from SC</span>
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 cursor-pointer rounded-md bg-emerald-700 py-2.5 text-center font-bold text-white transition hover:bg-emerald-800"
              >
                Apply Filters
              </button>
              <Link
                href="/women"
                className="flex cursor-pointer items-center justify-center rounded-md border border-slate-300 px-3 py-2.5 text-center text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                Clear
              </Link>
            </div>
          </form>
        </aside>

        {/* Women List Card */}
        <div className="surface-card flex flex-col overflow-hidden xl:col-span-3">
          {/* Table Container */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Muryar Uwa ID</th>
                  <th className="px-6 py-4">Participant Name</th>
                  <th className="px-6 py-4">Facility / LGA</th>
                  <th className="px-6 py-4">Safe Contact</th>
                  <th className="px-6 py-4">Communication</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-800">
                {women.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No matching participants found.
                    </td>
                  </tr>
                ) : (
                  women.map((woman) => {
                    const latestScreening = woman.nutritionScreenings[0];
                    const activeRefs = woman.referrals.length;
                    return (
                      <tr key={woman.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4.5 font-mono text-xs font-bold text-emerald-700">
                          {woman.uniqueCode}
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="font-semibold text-slate-950">
                            {woman.fullName || (
                              <span className="flex items-center gap-1.5 text-slate-600 text-xs italic">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                                {woman.codedName} (Anonymized)
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">Age: {woman.age} yrs</span>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="font-medium text-slate-800">{woman.facility.name}</div>
                          <span className="text-xs text-slate-500">{woman.lga.name} LGA</span>
                        </td>
                        <td className="px-6 py-4.5">
                          {getSafeBadge(woman.safeContactStatus)}
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex flex-col gap-0.5 text-xs text-slate-700">
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600">
                              <Languages className="w-3 h-3 text-emerald-700" />
                              {woman.preferredLanguage}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 mt-1">
                              <MessageCircle className="w-3 h-3 text-teal-400" />
                              {woman.preferredChannel.replace("_", " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          {getRiskBadge(latestScreening?.riskCategory)}
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {activeRefs > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                                {activeRefs} Ref
                              </span>
                            )}
                            <Link
                              href={`/women/${woman.id}`}
                              className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-500/30 transition-all cursor-pointer"
                              title="View Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/20 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                Showing page <span className="font-bold text-slate-700">{pageNum}</span> of{" "}
                <span className="font-bold text-slate-700">{totalPages}</span> ({totalCount} total)
              </span>

              <div className="flex gap-2">
                <Link
                  href={{
                    pathname: "/women",
                    query: { ...params, page: Math.max(1, pageNum - 1).toString() },
                  }}
                  className={`inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-600 transition-all ${
                    pageNum === 1 ? "opacity-50 pointer-events-none" : "hover:text-slate-800 hover:border-slate-200"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                <Link
                  href={{
                    pathname: "/women",
                    query: { ...params, page: Math.min(totalPages, pageNum + 1).toString() },
                  }}
                  className={`inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-600 transition-all ${
                    pageNum === totalPages ? "opacity-50 pointer-events-none" : "hover:text-slate-800 hover:border-slate-200"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
