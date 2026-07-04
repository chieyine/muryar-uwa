"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  UserCheck,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  Send,
  HelpCircle
} from "lucide-react";

interface MissedVisitsClientProps {
  missedVisits: any[];
  mobilizers: { id: string; fullName: string; role: string }[];
  currentUser: { id: string; role: string };
}

export default function MissedVisitsClient({
  missedVisits,
  mobilizers,
  currentUser,
}: MissedVisitsClientProps) {
  const router = useRouter();
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [resolveForm, setResolveForm] = useState({
    status: "COMPLETED",
    reasonForMissedVisit: "",
  });
  const [error, setError] = useState<string | null>(null);

  const calculateOverdueDays = (expectedDate: string) => {
    const diffTime = Date.now() - new Date(expectedDate).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleAction = async (endpoint: string, payload: any) => {
    if (!selectedVisit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/missed-visits/${selectedVisit.id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      // Close modal and refresh
      setActiveModal(null);
      setSelectedVisit(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update outreach");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Missed visits table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">PHC Facility</th>
                <th className="px-6 py-4">Visit Type Overdue</th>
                <th className="px-6 py-4">Expected Date</th>
                <th className="px-6 py-4">Days Overdue</th>
                <th className="px-6 py-4">Assigned Mobilizer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {missedVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No missed appointments found.
                  </td>
                </tr>
              ) : (
                missedVisits.map((v) => {
                  const overdue = calculateOverdueDays(v.expectedDate);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 block">
                          {v.woman.fullName || `${v.woman.codedName} (Anonymized)`}
                        </span>
                        <span className="font-mono text-[10px] text-emerald-700 font-bold mt-0.5 block">
                          {v.woman.uniqueCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {v.woman.facility.name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {v.visitType}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(v.expectedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`status-pill font-mono font-semibold ${
                          overdue >= 7 
                            ? "bg-red-50 text-red-700 border border-red-200" 
                            : overdue >= 3 
                            ? "bg-orange-50 text-orange-700 border border-orange-200" 
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}>
                          {overdue} Days
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {v.assignedTo ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">{v.assignedTo.fullName}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{v.assignedTo.role}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`status-pill ${
                          v.status === "COMPLETED" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : v.status === "ASSIGNED" 
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-xs">
                          {/* Assign Button (for Admin, Supervisor) */}
                          {["ADMIN", "SUPERVISOR"].includes(currentUser.role) && v.status === "OPEN" && (
                            <button
                              onClick={() => { setSelectedVisit(v); setActiveModal("assign"); }}
                              className="cursor-pointer rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                            >
                              Assign Mobilizer
                            </button>
                          )}
                          {/* Resolve Button (for Assigned mobilizer or Supervisor/Admin) */}
                          {v.status !== "COMPLETED" && v.status !== "CLOSED" && (
                            <button
                              onClick={() => { setSelectedVisit(v); setActiveModal("resolve"); }}
                              className="cursor-pointer rounded-md bg-emerald-700 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-emerald-800"
                            >
                              Resolve Outreach
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ALL MODAL OVERLAYS */}
      {activeModal && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={() => { setActiveModal(null); setSelectedVisit(null); }} />
          
          <div className="relative w-full max-w-lg surface-card p-8 space-y-6 z-10">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            {/* MODAL 1: ASSIGN MOBILIZER */}
            {activeModal === "assign" && (
              <div className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                  Assign Outreach Mobilizer
                </h3>

                <p className="text-slate-700">
                  Select a community nutrition mobilizer to conduct home outreach for participant{" "}
                  <span className="font-semibold text-slate-950">
                    {selectedVisit.woman.fullName || selectedVisit.woman.codedName}
                  </span>.
                </p>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nutrition Mobilizer</label>
                  <select
                    value={assignedToUserId}
                    onChange={(e) => setAssignedToUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
                  >
                    <option value="">Select Mobilizer...</option>
                    {mobilizers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => { setActiveModal(null); setSelectedVisit(null); }}
                    className="px-4 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction("assign", { assignedToUserId })}
                    disabled={loading || !assignedToUserId}
                    className="rounded-md bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                  >
                    {loading ? "Assigning..." : "Assign Task"}
                  </button>
                </div>
              </div>
            )}

            {/* MODAL 2: RESOLVE VISIT */}
            {activeModal === "resolve" && (
              <div className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                  Resolve Outreach Visit
                </h3>

                <p className="text-slate-700">
                  Document the outreach outcomes for participant{" "}
                  <span className="font-semibold text-slate-950">
                    {selectedVisit.woman.fullName || selectedVisit.woman.codedName}
                  </span>.
                </p>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Outreach Status</label>
                    <select
                      value={resolveForm.status}
                      onChange={(e) => setResolveForm(prev=>({...prev, status: e.target.value}))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
                    >
                      <option value="COMPLETED">Completed (Outreach met mother)</option>
                      <option value="RESCHEDULED">Rescheduled (Met & date shifted)</option>
                      <option value="CLOSED">Closed (Outreach completed without contact)</option>
                      <option value="ESCALATED">Escalated to Supervisor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Outreach Findings / Notes</label>
                    <textarea
                      value={resolveForm.reasonForMissedVisit}
                      onChange={(e) => setResolveForm(prev=>({...prev, reasonForMissedVisit: e.target.value}))}
                      rows={3}
                      placeholder="e.g. Visited household. Mother was traveling. Will return next week..."
                      className="w-full px-3 py-2 glass-input text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => { setActiveModal(null); setSelectedVisit(null); }}
                    className="px-4 py-2 rounded-md border border-slate-200 text-slate-600 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction("close", resolveForm)}
                    disabled={loading || !resolveForm.reasonForMissedVisit}
                    className="rounded-md bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                  >
                    {loading ? "Saving..." : "Log Outcome"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
