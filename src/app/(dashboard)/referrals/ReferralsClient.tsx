"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  Eye,
  Plus
} from "lucide-react";

interface ReferralsClientProps {
  referrals: any[];
  staff: { id: string; fullName: string; role: string }[];
  lgas: { id: string; name: string }[];
  facilities: { id: string; name: string }[];
  currentUser: { id: string; role: string };
  searchParams: any;
}

export default function ReferralsClient({
  referrals,
  staff,
  lgas,
  facilities,
  currentUser,
  searchParams,
}: ReferralsClientProps) {
  const router = useRouter();
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateNote, setUpdateNote] = useState("");
  const [updateStatus, setUpdateStatus] = useState("COMPLETED");
  const [error, setError] = useState<string | null>(null);
  const canFilterAssignedStaff = currentUser.role !== "MOBILIZER";

  const handleUpdateStatus = async (status: string, customNote?: string) => {
    if (!selectedReferral) return;
    const finalNote = customNote || updateNote;
    if (!finalNote) {
      setError("Please add a note to document this update.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/referrals/${selectedReferral.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: finalNote }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      // Close and refresh
      setSelectedReferral(null);
      setUpdateNote("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update referral");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENT": return "bg-red-50 text-red-700 border border-red-200";
      case "HIGH": return "bg-orange-50 text-orange-700 border border-orange-200";
      case "MEDIUM": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "LOW":
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "CLOSED": return "bg-slate-100 text-slate-600 border border-slate-200";
      case "ESCALATED": return "bg-red-50 text-red-700 border border-red-200";
      case "REFERRED": return "bg-blue-50 text-blue-700 border border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top filter bar */}
      <div className="surface-card p-5">
        <form method="GET" action="/referrals" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold uppercase tracking-wider">Referral Type</label>
            <select
              name="type"
              defaultValue={searchParams.type || ""}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
            >
              <option value="">All Types</option>
              <option value="ANC">ANC Follow-up</option>
              <option value="PNC">PNC Follow-up</option>
              <option value="PHC_REVIEW">PHC Medical Review</option>
              <option value="NUTRITION_COUNSELLING">Nutrition Counselling</option>
              <option value="MUAC_RECHECK">MUAC Recheck</option>
              <option value="OTP_FOLLOW_UP">OTP Admissions</option>
              <option value="SC_FOLLOW_UP">SC Discharge Follow-up</option>
              <option value="TOM_BROWN_DEMO">Tom Brown Demonstration</option>
              <option value="SEEDLING_SUPPORT">Seedling/Sack support</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold uppercase tracking-wider">Priority</label>
            <select
              name="priority"
              defaultValue={searchParams.priority || ""}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold uppercase tracking-wider">Status</label>
            <select
              name="status"
              defaultValue={searchParams.status || ""}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
            >
              <option value="">All Statuses</option>
              <option value="IDENTIFIED">Identified</option>
              <option value="COUNSELLED">Counselled</option>
              <option value="REFERRED">Referred</option>
              <option value="MESSAGE_SENT">Message Sent</option>
              <option value="REACHED">Reached</option>
              <option value="ATTENDED">Attended</option>
              <option value="COMPLETED">Completed</option>
              <option value="ESCALATED">Escalated</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {canFilterAssignedStaff ? (
            <div className="space-y-1">
              <label className="block text-slate-600 font-semibold uppercase tracking-wider">Assigned staff</label>
              <select
                name="assignedToId"
                defaultValue={searchParams.assignedToId || ""}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
              >
                <option value="">All Staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
              Showing referrals assigned to you.
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 cursor-pointer rounded-md bg-emerald-700 py-2 font-bold text-white transition hover:bg-emerald-800"
            >
              Filter
            </button>
            <a
              href="/referrals"
              className="flex cursor-pointer items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-center text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              Reset
            </a>
          </div>
        </form>
      </div>

      {/* Referrals Directory Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Facility / LGA</th>
                <th className="px-6 py-4">Referral Type</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Worker</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No matching referrals logged.
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 block">
                        {r.woman.fullName || `${r.woman.codedName} (Anonymized)`}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700 font-bold mt-0.5 block">
                        {r.woman.uniqueCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div>{r.woman.facility.name}</div>
                      <span className="text-xs text-slate-500">{r.woman.lga.name} LGA</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {r.referralType.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-pill ${getPriorityBadge(r.priority)}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-pill ${getStatusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {r.assignedTo?.fullName || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "Immediate"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedReferral(r)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Updates
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL: TIMELINE & UPDATES */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={() => setSelectedReferral(null)} />
          
          <div className="surface-card relative z-10 max-h-[90vh] w-full max-w-2xl space-y-6 overflow-y-auto p-8 shadow-2xl">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-700" />
                Referral Details: {selectedReferral.referralType.replace("_", " ")}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Participant: <span className="font-semibold text-slate-800">{selectedReferral.woman.fullName || selectedReferral.woman.codedName}</span> ({selectedReferral.woman.uniqueCode})
              </p>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
              <div>
                <span className="text-slate-500 block">Referral Reason / Findings:</span>
                <p className="font-medium mt-0.5">{selectedReferral.reason}</p>
              </div>
              <div>
                <span className="text-slate-500 block">Destination:</span>
                <p className="font-medium mt-0.5">{selectedReferral.destination || "PHC Clinic"}</p>
              </div>
              <div>
                <span className="text-slate-500 block">Priority:</span>
                <span className={`status-pill ${getPriorityBadge(selectedReferral.priority)} mt-1`}>
                  {selectedReferral.priority}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Status:</span>
                <span className={`status-pill ${getStatusBadge(selectedReferral.status)} mt-1`}>
                  {selectedReferral.status}
                </span>
              </div>
            </div>

            {/* Updates History Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status History Timeline</h4>
              
              <div className="space-y-3 pl-2 border-l border-slate-200">
                {selectedReferral.updates.map((update: any) => (
                  <div key={update.id} className="relative pl-4 space-y-1">
                    {/* Timeline Node dot */}
                    <div className="absolute top-1 left-[-5px] h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-600" />
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-800">{update.status}</span>
                      <span className="text-[10px] text-slate-500">{new Date(update.createdAt).toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">• {update.updatedBy.fullName} ({update.updatedBy.role})</span>
                    </div>
                    <p className="text-xs text-slate-600 italic leading-relaxed">{update.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action panel (if active) */}
            {selectedReferral.status !== "CLOSED" && (
              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Update Referral Status</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">New Status</label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
                    >
                      <option value="COUNSELLED">Counselled</option>
                      <option value="REFERRED">Referred</option>
                      <option value="MESSAGE_SENT">Message Sent</option>
                      <option value="REACHED">Reached</option>
                      <option value="ATTENDED">Attended Clinic</option>
                      <option value="COMPLETED">Completed (Action Met)</option>
                      <option value="ESCALATED">Escalated</option>
                      <option value="CLOSED">Closed (Supervisor/Finished)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Progress Notes</label>
                    <textarea
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      rows={2}
                      placeholder="Add follow-up notes (e.g. Attended Gwange OTP center successfully)..."
                      className="w-full px-3 py-1.5 glass-input text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleUpdateStatus("COMPLETED", "Marked as completed by outreach worker.")}
                    disabled={loading}
                    className="cursor-pointer rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Quick Complete
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("ESCALATED", "Marked as escalated: participant unreachable or requires mobilization.")}
                    disabled={loading}
                    className="cursor-pointer rounded-md border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                  >
                    Quick Escalate
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(updateStatus)}
                    disabled={loading}
                    className="cursor-pointer rounded-md bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                  >
                    {loading ? "Saving..." : "Save Update"}
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedReferral(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
