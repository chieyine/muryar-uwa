"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Phone,
  Activity,
  ClipboardList,
  MessageSquare,
  Sprout,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle,
  Plus,
  ShieldOff,
  User
} from "lucide-react";
import { classifyNutritionRisk, getMessageSafety } from "@/lib/riskRules";

interface WomanProfileProps {
  woman: any;
  staff: { id: string; fullName: string; role: string }[];
  currentUserRole: string;
  capabilities: {
    canViewDirectContact: boolean;
    canViewDetailedSafeContact: boolean;
    canManageParticipant: boolean;
    canLogNutritionScreening: boolean;
    canManageSafeContact: boolean;
    canCreateReferral: boolean;
    canCreateResilienceActivity: boolean;
    canLogSafeguardingConcern: boolean;
    canAssignOutreach: boolean;
  };
}

export default function WomanProfileClient({ woman, staff, currentUserRole, capabilities }: WomanProfileProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("screening");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Form States
  const [screeningForm, setScreeningForm] = useState({
    muacCm: "",
    oedema: false,
    visiblyWasted: false,
    appetiteConcern: false,
    householdFoodInsecurity: false,
  });

  const [referralForm, setReferralForm] = useState({
    referralType: "ANC",
    priority: "MEDIUM",
    reason: "",
    destination: "",
    dueDate: "",
    assignedToUserId: "",
  });

  const [activityForm, setActivityForm] = useState({
    activityType: "TOM_BROWN_DEMO",
    eligibilityReason: "LOW_MUAC",
    status: "PLANNED",
    activityDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [complaintForm, setComplaintForm] = useState({
    type: "COMPLAINT",
    severity: "MEDIUM",
    description: "",
  });

  const handleModalSubmit = async (endpoint: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/women/${woman.id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      // Success
      setActiveModal(null);
      router.refresh();
      // Reset forms
      resetForms();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setScreeningForm({
      muacCm: "",
      oedema: false,
      visiblyWasted: false,
      appetiteConcern: false,
      householdFoodInsecurity: false,
    });
    setReferralForm({
      referralType: "ANC",
      priority: "MEDIUM",
      reason: "",
      destination: "",
      dueDate: "",
      assignedToUserId: "",
    });
    setActivityForm({
      activityType: "TOM_BROWN_DEMO",
      eligibilityReason: "LOW_MUAC",
      status: "PLANNED",
      activityDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setComplaintForm({
      type: "COMPLAINT",
      severity: "MEDIUM",
      description: "",
    });
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "URGENT_REFERRAL": return "bg-red-50 text-red-700 border border-red-200";
      case "SEVERE_CONCERN": return "bg-orange-50 text-orange-700 border border-orange-200";
      case "MODERATE_CONCERN": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "AT_RISK": return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "NORMAL": return "bg-emerald-50 text-emerald-700 border border-emerald-150 border border-emerald-200";
      default: return "bg-slate-100 text-slate-500 border border-slate-200";
    }
  };

  const getSafeBadgeColor = (status: string) => {
    switch (status) {
      case "DIRECT_SAFE": return "bg-emerald-50 text-emerald-700 border border-emerald-200 border border-emerald-500/30";
      case "NEUTRAL_ONLY": return "bg-blue-500/15 text-blue-700 border border-blue-500/30";
      case "MOBILIZER_ONLY": return "bg-amber-500/15 text-amber-700 border border-amber-500/30";
      case "NO_DIRECT_CONTACT": return "bg-red-50 text-red-700 border border-red-500/30";
      case "OPTED_OUT": return "bg-slate-500/15 text-slate-500 border border-slate-200";
      default: return "bg-slate-500/15 text-slate-500 border border-slate-200";
    }
  };

  // Safe Contact details
  const activeAssessment = woman.safeContactAssessments[0] || {};
  const safeGuide = getMessageSafety(woman.safeContactStatus);

  const tabs = [
    { id: "screening", name: "Screenings", icon: Activity, count: woman.nutritionScreenings.length },
    { id: "referral", name: "Referrals", icon: ClipboardList, count: woman.referrals.length },
    { id: "messages", name: "Message History", icon: MessageSquare, count: woman.messageLogs.length },
    { id: "resilience", name: "Resilience Activities", icon: Sprout, count: woman.resilienceActivities.length },
    { id: "missed", name: "Missed Visits", icon: Clock, count: woman.missedVisits.length },
    { id: "complaints", name: "Safeguarding Flags", icon: ShieldAlert, count: woman.complaints.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Profile Summary */}
      <div className="p-6 surface-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-lg text-emerald-700 flex-shrink-0">
            {woman.fullName ? woman.fullName.split(" ").map((n: string) => n[0]).join("") : "AN"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-950">
                {woman.fullName || `${woman.codedName} (Anonymized)`}
              </h2>
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-500/5 border border-emerald-200 px-2 py-0.5 rounded">
                {woman.uniqueCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Age: {woman.age} yrs • Registered at {woman.facility.name} ({woman.lga.name} LGA)
            </p>
          </div>
        </div>

        {/* Statuses Quick Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Communication</span>
            {getSafeBadgeColor(woman.safeContactStatus) && (
              <span className={`status-pill ${getSafeBadgeColor(woman.safeContactStatus)}`}>
                {woman.safeContactStatus.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Nutrition Level</span>
            <span className={`status-pill ${getRiskBadgeColor(woman.nutritionScreenings[0]?.riskCategory)}`}>
              {woman.nutritionScreenings[0]?.riskCategory.replace("_", " ") || "No Screening"}
            </span>
          </div>

          {woman.status !== "OPTED_OUT" && capabilities.canManageSafeContact && (
            <button
              onClick={() => setActiveModal("opt-out")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 hover:border-red-500/40 text-slate-500 hover:text-red-700 hover:bg-red-500/5 text-xs font-semibold transition-all mt-4 sm:mt-0 cursor-pointer"
            >
              <ShieldOff className="w-3.5 h-3.5" />
              Opt Out
            </button>
          )}
        </div>
      </div>

      {/* Safeguarding Alert Card for Unsafe Phone Profiles */}
      {(woman.safeContactStatus === "NO_DIRECT_CONTACT" || woman.safeContactStatus === "MOBILIZER_ONLY") && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 shadow-sm animate-fade-in">
          <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
          <div>
            <h4 className="font-bold text-amber-950">Restricted Phone Outreach (Safeguarding Active)</h4>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-amber-900">
              This participant's phone status is flagged as unsafe or unreachable. Direct messaging channels are disabled. 
              Outreach tasks are dynamically routed to nutrition mobilizers for personal home visits.
            </p>
          </div>
        </div>
      )}

      {/* Main Split: Demographics & Safe Contact Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: General Profile Card */}
        <div className="lg:col-span-6 p-6 surface-card space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
            Maternal Demographics
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500">Pregnancy Status</span>
              <p className="font-semibold text-slate-800 mt-0.5">{woman.pregnancyStatus}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Breastfeeding Status</span>
              <p className="font-semibold text-slate-800 mt-0.5">{woman.breastfeedingStatus}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">LGA Settlement</span>
              <p className="font-semibold text-slate-800 mt-0.5">{woman.community}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Phone Status</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {activeAssessment.ownsPhone ? "Owns phone" : activeAssessment.sharedPhone ? `Shared (${activeAssessment.sharedWith || "hidden"})` : "No phone access"}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Caregiver status</span>
              <p className="font-semibold text-slate-800 mt-0.5">{woman.caregiverStatus ? "Caregiver (Under 5)" : "No children under 5"}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">OTP / SC status</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {woman.childInOtp ? "Child in OTP" : woman.childDischargedFromSc ? "Child discharged SC" : "No acute concern log"}
              </p>
            </div>
          </div>
          {!capabilities.canViewDirectContact && (
            <div className="p-3 rounded-md border border-slate-200 bg-slate-50 text-xs text-slate-600">
              Direct phone numbers are hidden for this role. Use assigned outreach workflows instead of ad hoc contact.
            </div>
          )}
        </div>

        {/* Right Side: Safe Contact Assessment Details */}
        <div className="lg:col-span-6 p-6 surface-card space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
            Safe Contact assessment
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500">Device Access Settings</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {activeAssessment.safeForCalls && <span className="status-pill bg-emerald-50 text-emerald-700 border border-emerald-150 text-[9px] py-0.5 px-2">CALLS SAFE</span>}
                {activeAssessment.safeForSms && <span className="status-pill bg-emerald-50 text-emerald-700 border border-emerald-150 text-[9px] py-0.5 px-2">SMS SAFE</span>}
                {activeAssessment.safeForWhatsapp && <span className="status-pill bg-emerald-50 text-emerald-700 border border-emerald-150 text-[9px] py-0.5 px-2">WHATSAPP SAFE</span>}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500">Preferred Channels</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {woman.preferredChannel} ({woman.preferredLanguage})
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Neutral Messages only</span>
              <p className="font-semibold text-slate-800 mt-0.5">{activeAssessment.neutralMessagesOnly ? "Yes" : "No"}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Safe Time Range</span>
              <p className="font-semibold text-slate-800 mt-0.5">{woman.safeContactTime || "Anytime"}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
            <ShieldAlert className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Safety Rule Enforcement:</span>
              <span>{safeGuide.reason}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation & CTA */}
      <div className="border-b border-slate-200 pb-px flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? "border-emerald-400 text-emerald-700 bg-emerald-500/5 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
                <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isSelected ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab CTA button */}
        <div className="self-end pb-1.5">
          {activeTab === "screening" && capabilities.canLogNutritionScreening && (
            <button
              onClick={() => setActiveModal("screening")}
              className="flex items-center gap-1 px-3.5 py-2 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              New Screening
            </button>
          )}
          {activeTab === "referral" && capabilities.canCreateReferral && (
            <button
              onClick={() => setActiveModal("referral")}
              className="flex items-center gap-1 px-3.5 py-2 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Referral
            </button>
          )}
          {activeTab === "resilience" && capabilities.canCreateResilienceActivity && (
            <button
              onClick={() => setActiveModal("resilience")}
              className="flex items-center gap-1 px-3.5 py-2 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Activity
            </button>
          )}
          {activeTab === "complaints" && capabilities.canLogSafeguardingConcern && (
            <button
              onClick={() => setActiveModal("complaint")}
              className="flex items-center gap-1 px-3.5 py-2 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Concern
            </button>
          )}
        </div>
      </div>

      {/* Tabs Panel Area */}
      <div className="surface-card p-6 overflow-x-auto min-h-[250px]">
        {/* NUTRITION SCREENINGS TAB */}
        {activeTab === "screening" && (
          <div className="space-y-4">
            {woman.nutritionScreenings.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No screening logs recorded.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Date Screened</th>
                    <th className="pb-3">MUAC (cm)</th>
                    <th className="pb-3">Oedema</th>
                    <th className="pb-3">Wasting</th>
                    <th className="pb-3">Appetite Concern</th>
                    <th className="pb-3">Food Insecurity</th>
                    <th className="pb-3">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {woman.nutritionScreenings.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3.5 font-medium">{new Date(s.screenedAt).toLocaleDateString()}</td>
                      <td className="py-3.5 font-mono text-sm font-semibold">{s.muacCm ? `${s.muacCm} cm` : "Oedema"}</td>
                      <td className="py-3.5">{s.oedema ? "YES (Bilateral)" : "NO"}</td>
                      <td className="py-3.5">{s.visiblyWasted ? "YES" : "NO"}</td>
                      <td className="py-3.5">{s.appetiteConcern ? "YES" : "NO"}</td>
                      <td className="py-3.5">{s.householdFoodInsecurity ? "YES" : "NO"}</td>
                      <td className="py-3.5">
                        <span className={`status-pill ${getRiskBadgeColor(s.riskCategory)}`}>
                          {s.riskCategory.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* REFERRALS TAB */}
        {activeTab === "referral" && (
          <div className="space-y-4">
            {woman.referrals.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No referrals recorded.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Referral Type</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Assigned To</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3">Note Reason</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {woman.referrals.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3.5 font-semibold text-slate-800">{r.referralType.replace("_", " ")}</td>
                      <td className="py-3.5">
                        <span className={`status-pill ${
                          r.priority === "URGENT" ? "bg-red-50 text-red-700" : r.priority === "HIGH" ? "bg-orange-50 text-orange-700" : "bg-slate-800 text-slate-500"
                        }`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="status-pill bg-slate-800/80 text-slate-700 border border-slate-200">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5">{r.assignedTo?.fullName || "Unassigned"}</td>
                      <td className="py-3.5">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "Immediate"}</td>
                      <td className="py-3.5 max-w-xs truncate text-slate-500" title={r.reason}>{r.reason}</td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/referrals`}
                          className="text-emerald-700 hover:text-emerald-300 font-bold"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MESSAGE HISTORY TAB */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            {woman.messageLogs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No messages scheduled or sent.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Scheduled Date</th>
                    <th className="pb-3">Template Title</th>
                    <th className="pb-3">Channel</th>
                    <th className="pb-3">Delivery Status</th>
                    <th className="pb-3">Response status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {woman.messageLogs.map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-3.5">{new Date(l.scheduledAt).toLocaleDateString()}</td>
                      <td className="py-3.5 font-semibold text-slate-800">{l.template.title}</td>
                      <td className="py-3.5">{l.channel}</td>
                      <td className="py-3.5">
                        <span className={`status-pill ${
                          l.deliveryStatus === "DELIVERED" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-150" 
                            : l.deliveryStatus === "FAILED"
                            ? "bg-red-50 text-red-700"
                            : l.deliveryStatus === "SKIPPED_UNSAFE"
                            ? "bg-slate-800 text-red-300 border-red-500/30"
                            : "bg-slate-800 text-slate-500"
                        }`}>
                          {l.deliveryStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {l.responseStatus ? l.responseStatus.replace("_", " ") : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* NUTRITION RESILIENCE TAB */}
        {activeTab === "resilience" && (
          <div className="space-y-4">
            {woman.resilienceActivities.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No resilience activities recorded.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Activity Date</th>
                    <th className="pb-3">Resilience Activity</th>
                    <th className="pb-3">Eligibility Reason</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Follow-Up Date</th>
                    <th className="pb-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {woman.resilienceActivities.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-3.5">{new Date(a.activityDate).toLocaleDateString()}</td>
                      <td className="py-3.5 font-semibold text-slate-800">{a.activityType.replace("_", " ")}</td>
                      <td className="py-3.5 text-slate-500">{a.eligibilityReason.replace("_", " ")}</td>
                      <td className="py-3.5">
                        <span className={`status-pill ${
                          a.status === "COMPLETED" || a.status === "RECEIVED" || a.status === "ATTENDED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                            : "bg-slate-800 text-slate-500"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3.5">{a.followUpDate ? new Date(a.followUpDate).toLocaleDateString() : "N/A"}</td>
                      <td className="py-3.5 text-slate-500 max-w-xs truncate" title={a.notes}>{a.notes || "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MISSED VISITS TAB */}
        {activeTab === "missed" && (
          <div className="space-y-4">
            {woman.missedVisits.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No missed visit flags logged.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Expected Date</th>
                    <th className="pb-3">Visit Type</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Assigned Mobilizer</th>
                    <th className="pb-3">Outreach reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {woman.missedVisits.map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-3.5">{new Date(v.expectedDate).toLocaleDateString()}</td>
                      <td className="py-3.5 font-semibold text-slate-800">{v.visitType}</td>
                      <td className="py-3.5">
                        <span className={`status-pill ${
                          v.status === "OPEN" ? "bg-red-50 text-red-700" : "bg-slate-800 text-slate-500"
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3.5">{v.assignedTo?.fullName || "Unassigned"}</td>
                      <td className="py-3.5 text-slate-500">{v.reasonForMissedVisit || "Outreach pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SAFEGUARDING TAB */}
        {activeTab === "complaints" && (
          <div className="space-y-4">
            {woman.complaints.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No safeguarding concerns logged.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Date Logged</th>
                    <th className="pb-3">Concern Type</th>
                    <th className="pb-3">Severity</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {woman.complaints.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3.5">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 font-semibold text-slate-800">{c.type.replace("_", " ")}</td>
                      <td className="py-3.5">
                        <span className={`status-pill ${
                          c.severity === "CRITICAL" ? "bg-red-500/20 text-red-700 font-bold border border-red-500/30" : "bg-slate-800 text-slate-500"
                        }`}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="status-pill bg-slate-800 text-slate-700">{c.status}</span>
                      </td>
                      <td className="py-3.5 text-slate-500 max-w-sm truncate" title={c.description}>{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ALL MODAL OVERLAYS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-lg surface-card p-8 space-y-5 z-10">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            {/* MODAL 1: NEW SCREENING */}
            {activeModal === "screening" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-700" />
                  Log New Nutrition Screening
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">MUAC Reading (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 21.5"
                      value={screeningForm.muacCm}
                      onChange={(e) => setScreeningForm(prev=>({...prev, muacCm: e.target.value}))}
                      className="w-full px-3 py-2 glass-input text-slate-800"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={screeningForm.oedema}
                        onChange={(e) => setScreeningForm(prev=>({...prev, oedema: e.target.checked}))}
                        className="rounded bg-white border-slate-200 text-emerald-500"
                      />
                      <span>Bilateral Pitting Oedema</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={screeningForm.visiblyWasted}
                        onChange={(e) => setScreeningForm(prev=>({...prev, visiblyWasted: e.target.checked}))}
                        className="rounded bg-white border-slate-200 text-emerald-500"
                      />
                      <span>Visibly Wasted</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={screeningForm.appetiteConcern}
                        onChange={(e) => setScreeningForm(prev=>({...prev, appetiteConcern: e.target.checked}))}
                        className="rounded bg-white border-slate-200 text-emerald-500"
                      />
                      <span>Appetite Concern / Poor Intake</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={screeningForm.householdFoodInsecurity}
                        onChange={(e) => setScreeningForm(prev=>({...prev, householdFoodInsecurity: e.target.checked}))}
                        className="rounded bg-white border-slate-200 text-emerald-500"
                      />
                      <span>Household Food Insecurity Concerns</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-md border border-slate-200 text-slate-500 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleModalSubmit("screening", screeningForm)}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                  >
                    {loading ? "Saving..." : "Save Screening"}
                  </button>
                </div>
              </div>
            )}

            {/* MODAL 2: CREATE REFERRAL */}
            {activeModal === "referral" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-700" />
                  Create Facility Referral
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Referral Type</label>
                    <select
                      value={referralForm.referralType}
                      onChange={(e) => setReferralForm(prev=>({...prev, referralType: e.target.value}))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
                    >
                      <option value="ANC">ANC Follow-up</option>
                      <option value="PNC">PNC Follow-up</option>
                      <option value="PHC_REVIEW">PHC Medical Review</option>
                      <option value="NUTRITION_COUNSELLING">Nutrition Counselling</option>
                      <option value="MUAC_RECHECK">MUAC Re-check</option>
                      <option value="OTP_FOLLOW_UP">OTP Admissions</option>
                      <option value="SC_FOLLOW_UP">SC Discharge Follow-up</option>
                      <option value="TOM_BROWN_DEMO">Tom Brown Demonstration</option>
                      <option value="SEEDLING_SUPPORT">Seedling/Sack-garden support</option>
                      <option value="FSL_SOCIAL_PROTECTION">FSL / Protection referral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Priority</label>
                    <select
                      value={referralForm.priority}
                      onChange={(e) => setReferralForm(prev=>({...prev, priority: e.target.value}))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent (Emergency)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Reason / Clinical Note</label>
                    <textarea
                      rows={3}
                      value={referralForm.reason}
                      onChange={(e) => setReferralForm(prev=>({...prev, reason: e.target.value}))}
                      placeholder="Specify findings leading to referral..."
                      className="w-full px-3 py-2 glass-input text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Destination Location</label>
                      <input
                        type="text"
                        value={referralForm.destination}
                        onChange={(e) => setReferralForm(prev=>({...prev, destination: e.target.value}))}
                        placeholder="e.g. Gwange PHC OTP Unit"
                        className="w-full px-3 py-2 glass-input text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Due Date</label>
                      <input
                        type="date"
                        value={referralForm.dueDate}
                        onChange={(e) => setReferralForm(prev=>({...prev, dueDate: e.target.value}))}
                        className="w-full px-3 py-2 glass-input text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Assign Outreach Worker</label>
                    <select
                      value={referralForm.assignedToUserId}
                      onChange={(e) => setReferralForm(prev=>({...prev, assignedToUserId: e.target.value}))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
                    >
                      <option value="">Leave Unassigned</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-md border border-slate-200 text-slate-500 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleModalSubmit("referral", referralForm)}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                  >
                    {loading ? "Submitting..." : "Submit Referral"}
                  </button>
                </div>
              </div>
            )}

            {/* MODAL 3: RECORD RESILIENCE ACTIVITY */}
            {activeModal === "resilience" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-700" />
                  Record Resilience Activity
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Activity Type</label>
                    <select
                      value={activityForm.activityType}
                      onChange={(e) => setActivityForm(prev=>({...prev, activityType: e.target.value}))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
                    >
                      <option value="TOM_BROWN_DEMO">Tom Brown Demonstration</option>
                      <option value="LOCAL_FOOD_DEMO">Local Food Demo</option>
                      <option value="MUAC_FOLLOWUP">Outreach MUAC Recheck</option>
                      <option value="SEEDLING_SUPPORT">Seedling Support pack</option>
                      <option value="SACK_GARDEN_SUPPORT">Sack Garden setup support</option>
                      <option value="NUTRITION_GROUP">Nutrition Resilience Group link</option>
                      <option value="FSL_REFERRAL">FSL service mapping</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Eligibility Reason</label>
                    <select
                      value={activityForm.eligibilityReason}
                      onChange={(e) => setActivityForm(prev=>({...prev, eligibilityReason: e.target.value}))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
                    >
                      <option value="LOW_MUAC">Low MUAC screening</option>
                      <option value="PREGNANT">Pregnant mother vulnerability</option>
                      <option value="BREASTFEEDING">Breastfeeding mother vulnerability</option>
                      <option value="CAREGIVER_OF_SAM_CHILD">Caregiver of child in OTP</option>
                      <option value="SC_DISCHARGE_CAREGIVER">Caregiver of child discharged SC</option>
                      <option value="HOUSEHOLD_FOOD_INSECURITY">Household food insecurity</option>
                      <option value="SUPERVISOR_APPROVED">Supervisor Approved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Status</label>
                    <select
                      value={activityForm.status}
                      onChange={(e) => setActivityForm(prev=>({...prev, status: e.target.value}))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="ATTENDED">Attended session</option>
                      <option value="RECEIVED">Received items/pack</option>
                      <option value="REFERRED">Referred out</option>
                      <option value="COMPLETED">Completed track</option>
                      <option value="MISSED">Missed activity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Activity Date</label>
                    <input
                      type="date"
                      value={activityForm.activityDate}
                      onChange={(e) => setActivityForm(prev=>({...prev, activityDate: e.target.value}))}
                      className="w-full px-3 py-2 glass-input text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Notes / Action Details</label>
                    <textarea
                      rows={3}
                      value={activityForm.notes}
                      onChange={(e) => setActivityForm(prev=>({...prev, notes: e.target.value}))}
                      placeholder="Enter details of seedlings, group linked or demonstration details..."
                      className="w-full px-3 py-2 glass-input text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-md border border-slate-200 text-slate-500 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleModalSubmit("resilience", activityForm)}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                  >
                    {loading ? "Recording..." : "Record Activity"}
                  </button>
                </div>
              </div>
            )}

            {/* MODAL 4: LOG SAFEGUARDING CONCERN */}
            {activeModal === "complaint" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-700" />
                  Log Safeguarding / Security Concern
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Concern Type</label>
                    <select
                      value={complaintForm.type}
                      onChange={(e) => setComplaintForm(prev=>({...prev, type: e.target.value}))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
                    >
                      <option value="COMPLAINT">General Service Complaint</option>
                      <option value="SAFE_CONTACT_CONCERN">Safe Contact Concern (phone monitored)</option>
                      <option value="GBV_DISCLOSURE">GBV Disclosure</option>
                      <option value="DATA_PRIVACY">Data Privacy Concern</option>
                      <option value="STAFF_CONDUCT">Staff Conduct</option>
                      <option value="FRAUD">Fraud/Exploitation report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Severity</label>
                    <select
                      value={complaintForm.severity}
                      onChange={(e) => setComplaintForm(prev=>({...prev, severity: e.target.value}))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700"
                    >
                      <option value="LOW">Low (Log only)</option>
                      <option value="MEDIUM">Medium (Review required)</option>
                      <option value="HIGH">High (Immediate check)</option>
                      <option value="CRITICAL">Critical (GBV/Safety Threat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Case Description</label>
                    <textarea
                      rows={4}
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm(prev=>({...prev, description: e.target.value}))}
                      placeholder="Note: For protection concerns, minimize sensitive narrative text. Log facts and immediate actions needed only."
                      className="w-full px-3 py-2 glass-input text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-md border border-slate-200 text-slate-500 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleModalSubmit("complaint", complaintForm)}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                  >
                    {loading ? "Logging case..." : "Log Concern"}
                  </button>
                </div>
              </div>
            )}

            {/* MODAL 5: CONFIRM OPT OUT */}
            {activeModal === "opt-out" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <ShieldOff className="w-5 h-5 text-red-700" />
                  Opt-Out Confirmation
                </h3>

                <p className="text-xs text-slate-700 leading-relaxed">
                  Opting out this participant will set their Safe Contact Status to <span className="font-semibold text-red-700">OPTED_OUT</span>, immediately stop all scheduled SMS/Voice/WhatsApp alerts, and restrict further follow-up outreach. 
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Are you sure you want to perform this action?
                </p>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-md border border-slate-200 text-slate-500 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleModalSubmit("opt-out", {})}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-400 text-white text-xs font-bold"
                  >
                    {loading ? "Opting out..." : "Yes, Opt Out"}
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
