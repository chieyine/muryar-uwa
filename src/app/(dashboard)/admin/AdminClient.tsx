"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Plus,
  Users,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface AdminClientProps {
  users: any[];
  lgas: any[];
  facilities: any[];
  templates: any[];
}

export default function AdminClient({ users, lgas, facilities, templates }: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form States
  const [lgaForm, setLgaForm] = useState({ name: "", state: "Borno" });
  const [facilityForm, setFacilityForm] = useState({ name: "", lgaId: "", type: "PHC", hasStarlink: false });
  const [userForm, setUserForm] = useState({ fullName: "", email: "", password: "", role: "CHEW", lgaId: "", facilityId: "" });
  const [templateForm, setTemplateForm] = useState({ title: "", category: "ANC_REMINDER", language: "HAUSA", channel: "VOICE", contentText: "" });

  const handleFormSubmit = async (endpoint: string, payload: any, resetFormCallback: () => void) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      setSuccess(`Successfully added new ${endpoint}!`);
      resetFormCallback();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "users", name: "Staff Management", icon: Users },
    { id: "facilities", name: "LGAs & Facilities", icon: MapPin },
    { id: "templates", name: "Outreach Templates", icon: FileText },
  ];

  return (
    <div className="space-y-6 text-xs md:text-sm">
      {success && (
        <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 pb-px flex gap-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError(null);
                setSuccess(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
                isSelected
                  ? "border-emerald-400 text-emerald-700 bg-emerald-500/5"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Main Grid split: Actions form left, Table view right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Create Forms */}
        <div className="xl:col-span-4 p-6 rounded-2xl glass-panel space-y-4">
          
          {/* USER FORM */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
                Add New Staff Member
              </h3>
              <div className="space-y-3.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm(prev=>({...prev, fullName: e.target.value}))}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 text-xs glass-input text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev=>({...prev, email: e.target.value}))}
                    placeholder="e.g. john@muryaruwa.org"
                    className="w-full px-3 py-2 text-xs glass-input text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev=>({...prev, password: e.target.value}))}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs glass-input text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">System Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm(prev=>({...prev, role: e.target.value}))}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md text-slate-700 text-xs"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="CHEW">CHEW</option>
                    <option value="MIDWIFE">MIDWIFE</option>
                    <option value="MOBILIZER">MOBILIZER</option>
                    <option value="PHC_BOARD_VIEWER">PHC BOARD VIEW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Assigned LGA</label>
                  <select
                    value={userForm.lgaId}
                    onChange={(e) => setUserForm(prev=>({...prev, lgaId: e.target.value}))}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md text-slate-700 text-xs"
                  >
                    <option value="">None / All</option>
                    {lgas.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Assigned Health Facility</label>
                  <select
                    value={userForm.facilityId}
                    onChange={(e) => setUserForm(prev=>({...prev, facilityId: e.target.value}))}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md text-slate-700 text-xs"
                  >
                    <option value="">None</option>
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => handleFormSubmit("user", userForm, () => setUserForm({ fullName: "", email: "", password: "", role: "CHEW", lgaId: "", facilityId: "" }))}
                  disabled={loading}
                  className="w-full py-2.5 rounded-md bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all text-xs cursor-pointer text-center"
                >
                  Create User
                </button>
              </div>
            </div>
          )}

          {/* FACILITY & LGA FORM */}
          {activeTab === "facilities" && (
            <div className="space-y-6">
              {/* LGA FORM */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Create Local Govt Area (LGA)
                </h3>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">LGA Name</label>
                  <input
                    type="text"
                    value={lgaForm.name}
                    onChange={(e) => setLgaForm(prev=>({...prev, name: e.target.value}))}
                    placeholder="e.g. Monguno"
                    className="w-full px-3 py-2 text-xs glass-input text-slate-800"
                  />
                </div>
                <button
                  onClick={() => handleFormSubmit("lga", lgaForm, () => setLgaForm({ name: "", state: "Borno" }))}
                  disabled={loading}
                  className="w-full py-2 rounded-md bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all text-xs cursor-pointer text-center"
                >
                  Add LGA
                </button>
              </div>

              {/* FACILITY FORM */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Create Primary Health Care (PHC)
                </h3>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Facility Name</label>
                  <input
                    type="text"
                    value={facilityForm.name}
                    onChange={(e) => setFacilityForm(prev=>({...prev, name: e.target.value}))}
                    placeholder="e.g. Muna Clinic PHC"
                    className="w-full px-3 py-2 text-xs glass-input text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">LGA Parent</label>
                  <select
                    value={facilityForm.lgaId}
                    onChange={(e) => setFacilityForm(prev=>({...prev, lgaId: e.target.value}))}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md text-slate-700 text-xs"
                  >
                    <option value="">Select LGA...</option>
                    {lgas.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Facility Type</label>
                  <select
                    value={facilityForm.type}
                    onChange={(e) => setFacilityForm(prev=>({...prev, type: e.target.value}))}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md text-slate-700 text-xs"
                  >
                    <option value="PHC">PHC (Health Center)</option>
                    <option value="SC">SC (Stabilization Center)</option>
                    <option value="OTP">OTP (Outpatient Treatment)</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={facilityForm.hasStarlink}
                    onChange={(e) => setFacilityForm(prev=>({...prev, hasStarlink: e.target.checked}))}
                    className="rounded bg-white border-slate-200 text-emerald-500"
                  />
                  <span>Starlink Equipped (Yes/No)</span>
                </label>

                <button
                  onClick={() => handleFormSubmit("facility", facilityForm, () => setFacilityForm({ name: "", lgaId: "", type: "PHC", hasStarlink: false }))}
                  disabled={loading}
                  className="w-full py-2 rounded-md bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all text-xs cursor-pointer text-center"
                >
                  Add Facility
                </button>
              </div>
            </div>
          )}

          {/* TEMPLATES FORM */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
                Add Message Template
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Template Title</label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm(prev=>({...prev, title: e.target.value}))}
                    placeholder="e.g. Maternal Nutrition Advice"
                    className="w-full px-3 py-2 text-xs glass-input text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Outreach Category</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm(prev=>({...prev, category: e.target.value}))}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md text-slate-700 text-xs"
                  >
                    <option value="ANC_REMINDER">ANC REMINDER</option>
                    <option value="PNC_REMINDER">PNC REMINDER</option>
                    <option value="OTP_REMINDER">OTP REMINDER</option>
                    <option value="MATERNAL_NUTRITION">MATERNAL NUTRITION</option>
                    <option value="SAFE_CONTACT">NEUTRAL SAFE HEALTH</option>
                    <option value="TOM_BROWN">TOM BROWN INVITE</option>
                    <option value="SEEDLING">SEEDLING WORKSHOP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Language</label>
                  <select
                    value={templateForm.language}
                    onChange={(e) => setTemplateForm(prev=>({...prev, language: e.target.value}))}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md text-slate-700 text-xs"
                  >
                    <option value="HAUSA">Hausa</option>
                    <option value="KANURI">Kanuri</option>
                    <option value="FULFULDE">Fulfulde</option>
                    <option value="ENGLISH">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Delivery Channel</label>
                  <select
                    value={templateForm.channel}
                    onChange={(e) => setTemplateForm(prev=>({...prev, channel: e.target.value}))}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md text-slate-700 text-xs"
                  >
                    <option value="VOICE">VOICE (Recommended)</option>
                    <option value="IVR">IVR</option>
                    <option value="SMS">SMS</option>
                    <option value="WHATSAPP_VOICE">WHATSAPP VOICE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Text Content</label>
                  <textarea
                    value={templateForm.contentText}
                    onChange={(e) => setTemplateForm(prev=>({...prev, contentText: e.target.value}))}
                    rows={4}
                    placeholder="Type translation content here..."
                    className="w-full px-3 py-2 text-xs glass-input text-slate-800"
                  />
                </div>
                
                <button
                  onClick={() => handleFormSubmit("template", templateForm, () => setTemplateForm({ title: "", category: "ANC_REMINDER", language: "HAUSA", channel: "VOICE", contentText: "" }))}
                  disabled={loading}
                  className="w-full py-2.5 rounded-md bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all text-xs cursor-pointer text-center"
                >
                  Save Template
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Table View */}
        <div className="xl:col-span-8 rounded-2xl glass-panel p-6 overflow-x-auto min-h-[300px]">
          
          {/* USERS TABLE */}
          {activeTab === "users" && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="pb-3">Full Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">System Role</th>
                  <th className="pb-3">Assignment Sector</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-800">{u.fullName}</td>
                    <td className="py-3 text-slate-600">{u.email}</td>
                    <td className="py-3">
                      <span className="status-pill bg-emerald-50 text-emerald-700 text-[10px] py-0.5">{u.role}</span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {u.facility ? u.facility.name : u.lga ? `${u.lga.name} LGA` : "State Supervisor"}
                    </td>
                    <td className="py-3">
                      {u.isActive ? (
                        <span className="text-emerald-700 font-semibold">Active</span>
                      ) : (
                        <span className="text-slate-500">Suspended</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* LGAs & PHCs TABLE */}
          {activeTab === "facilities" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Registered LGA Sectors</h4>
                <div className="flex flex-wrap gap-2">
                  {lgas.map(l => (
                    <span key={l.id} className="px-3 py-1.5 rounded-md border border-slate-200 bg-white font-bold text-slate-700">
                      {l.name} LGA ({l.state})
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Registered Health Facilities</h4>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <th className="pb-3">PHC Clinic</th>
                      <th className="pb-3">LGA Region</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Connectivity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                    {facilities.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="py-3 font-semibold text-slate-800">{f.name}</td>
                        <td className="py-3 text-slate-600">{f.lga.name}</td>
                        <td className="py-3">{f.type}</td>
                        <td className="py-3">
                          {f.hasStarlink ? (
                            <span className="status-pill bg-emerald-50 text-emerald-700 text-[9px] py-0.5">STARLINK ACTIVE</span>
                          ) : (
                            <span className="text-slate-500">Standard GSM</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TEMPLATES TABLE */}
          {activeTab === "templates" && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Delivery channel</th>
                  <th className="pb-3">Language</th>
                  <th className="pb-3">Content</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                {templates.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-800">{t.title}</td>
                    <td className="py-3 text-slate-600">{t.category.replace("_", " ")}</td>
                    <td className="py-3">{t.channel}</td>
                    <td className="py-3 text-slate-700">{t.language}</td>
                    <td className="py-3 max-w-xs truncate text-slate-600" title={t.contentText}>{t.contentText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
