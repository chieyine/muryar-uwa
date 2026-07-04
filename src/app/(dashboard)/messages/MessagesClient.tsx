"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Sprout,
  Send,
  AlertOctagon,
  EyeOff,
  UserCheck,
  Play,
  CheckCircle,
  FileText,
  Languages,
  Radio
} from "lucide-react";

interface MessagesClientProps {
  templates: any[];
  scheduledLogs: any[];
  sentLogs: any[];
  failedLogs: any[];
  skippedLogs: any[];
  mobilizerLogs: any[];
}

export default function MessagesClient({
  templates,
  scheduledLogs,
  sentLogs,
  failedLogs,
  skippedLogs,
  mobilizerLogs,
}: MessagesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("templates");
  const [loading, setLoading] = useState(false);
  const [simulatedCount, setSimulatedCount] = useState<number | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    setSimulatedCount(null);
    try {
      const res = await fetch("/api/messages/simulate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSimulatedCount(data.processedCount);
        router.refresh();
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "templates", name: "Message Templates", count: templates.length, icon: FileText },
    { id: "scheduled", name: "Scheduled Queue", count: scheduledLogs.length, icon: Radio },
    { id: "sent", name: "Sent Logs", count: sentLogs.length, icon: Send },
    { id: "failed", name: "Failed Transmission", count: failedLogs.length, icon: AlertOctagon },
    { id: "skipped", name: "Unsafe / Skipped", count: skippedLogs.length, icon: EyeOff },
    { id: "mobilizer", name: "Mobilizer Assigned", count: mobilizerLogs.length, icon: UserCheck },
  ];

  const getResponseBadge = (r: string) => {
    switch (r) {
      case "CONFIRMED": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "CALLBACK_REQUESTED": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "HELP_NEEDED": return "bg-red-50 text-red-700 border border-red-200";
      case "NO_RESPONSE":
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header CTA */}
      <div className="surface-card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <p className="section-kicker">Voice-first outreach</p>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <Radio className="w-5 h-5 text-emerald-700" />
            Messaging Queue
          </h3>
          <p className="text-xs text-slate-600">
            Simulate scheduled voice, SMS, WhatsApp, and mobilizer follow-up while preserving safe contact rules.
          </p>
        </div>

        <div>
          <button
            onClick={handleSimulate}
            disabled={loading || scheduledLogs.length === 0}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50 sm:w-auto"
          >
            <Play className="w-4 h-4 fill-white" />
            {loading ? "Simulating dispatch..." : "Trigger Simulation Run"}
          </button>
        </div>
      </div>

      {simulatedCount !== null && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>Successfully simulated dispatch for <span className="font-bold">{simulatedCount}</span> pending messages!</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-md px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                isSelected
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
              <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                isSelected ? "bg-white text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div className="surface-card min-h-[300px] overflow-x-auto p-6">
        {/* TEMPLATES TAB */}
        {activeTab === "templates" && (
          <>
          <div className="grid gap-3 md:hidden">
            {templates.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{t.title}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {t.category.replace("_", " ")}
                    </p>
                  </div>
                  <span className="status-pill bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t.channel}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-bold uppercase tracking-wide text-slate-500">Language</p>
                    <p className="mt-1 font-semibold text-slate-800">{t.language}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-wide text-slate-500">Channel</p>
                    <p className="mt-1 font-semibold text-slate-800">{t.channel}</p>
                  </div>
                </div>
                <p className="mt-3 whitespace-normal break-words text-xs leading-5 text-slate-600">
                  {t.contentText}
                </p>
              </div>
            ))}
          </div>

          <table className="hidden w-full table-fixed text-left md:table">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="w-[18%] pb-3 pr-4">Title</th>
                <th className="w-[16%] pb-3 pr-4">Category</th>
                <th className="w-[12%] pb-3 pr-4">Channel</th>
                <th className="w-[12%] pb-3 pr-4">Language</th>
                <th className="w-[42%] pb-3">Template Content Script</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3.5 pr-4 align-top font-semibold text-slate-800">{t.title}</td>
                  <td className="py-3.5 pr-4 align-top text-slate-600">{t.category.replace("_", " ")}</td>
                  <td className="py-3.5 pr-4 align-top">{t.channel}</td>
                  <td className="py-3.5 pr-4 align-top font-medium">{t.language}</td>
                  <td className="whitespace-normal break-words py-3.5 align-top leading-relaxed text-slate-600">{t.contentText}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}

        {/* LOG TABLES (SHARED LAYOUT) */}
        {["scheduled", "sent", "failed", "skipped", "mobilizer"].includes(activeTab) && (() => {
          let dataset = scheduledLogs;
          if (activeTab === "sent") dataset = sentLogs;
          if (activeTab === "failed") dataset = failedLogs;
          if (activeTab === "skipped") dataset = skippedLogs;
          if (activeTab === "mobilizer") dataset = mobilizerLogs;

          return (
            <div>
              {dataset.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-12">No messages logged in this category.</p>
              ) : (
                <>
                <div className="grid gap-3 md:hidden">
                  {dataset.map((log) => (
                    <div key={log.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900">{log.woman.fullName || log.woman.codedName}</p>
                          <p className="mt-1 font-mono text-[10px] font-bold text-slate-500">{log.woman.uniqueCode}</p>
                        </div>
                        <span className="status-pill bg-blue-50 text-blue-700 border border-blue-200">{log.channel}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="font-bold uppercase tracking-wide text-slate-500">Scheduled</p>
                          <p className="mt-1 text-slate-800">{new Date(log.scheduledAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-wide text-slate-500">Preferred time</p>
                          <p className="mt-1 text-slate-800">{log.woman.safeContactTime || "Anytime"}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs font-semibold text-slate-800">{log.template.title}</p>
                      {activeTab === "sent" && (
                        <div className="mt-3">
                          <span className={`status-pill ${getResponseBadge(log.responseStatus)}`}>
                            {log.responseStatus ? log.responseStatus.replace("_", " ") : "NO RESPONSE"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <table className="hidden w-full table-fixed text-left md:table">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <th className="w-[13%] pb-3 pr-4">Scheduled Date</th>
                      <th className="w-[20%] pb-3 pr-4">Participant</th>
                      <th className="w-[16%] pb-3 pr-4">Preferred Time</th>
                      <th className="w-[23%] pb-3 pr-4">Template Title</th>
                      <th className="w-[12%] pb-3 pr-4">Channel</th>
                      {activeTab === "sent" && <th className="w-[16%] pb-3">Delivery Response</th>}
                      {activeTab !== "scheduled" && <th className="w-[16%] pb-3">Sent Time</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                    {dataset.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3.5 pr-4 align-top">{new Date(log.scheduledAt).toLocaleDateString()}</td>
                        <td className="py-3.5 pr-4 align-top">
                          <span className="font-semibold text-slate-800 block">
                            {log.woman.fullName || log.woman.codedName}
                          </span>
                          <span className="font-mono text-[9px] text-slate-500 block mt-0.5">{log.woman.uniqueCode}</span>
                        </td>
                        <td className="whitespace-normal break-words py-3.5 pr-4 align-top text-slate-600">{log.woman.safeContactTime || "Anytime"}</td>
                        <td className="whitespace-normal break-words py-3.5 pr-4 align-top font-medium text-slate-800">{log.template.title}</td>
                        <td className="py-3.5 pr-4 align-top">{log.channel}</td>
                        {activeTab === "sent" && (
                          <td className="py-3.5 align-top">
                            <span className={`status-pill ${getResponseBadge(log.responseStatus)}`}>
                              {log.responseStatus ? log.responseStatus.replace("_", " ") : "NO RESPONSE"}
                            </span>
                          </td>
                        )}
                        {activeTab !== "scheduled" && (
                          <td className="py-3.5 align-top text-slate-600">
                            {log.sentAt ? new Date(log.sentAt).toLocaleTimeString() : "N/A"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
