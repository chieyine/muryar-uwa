"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Phone,
  AlertTriangle,
  Activity,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { classifyNutritionRisk, getRecommendedActions, getMessageSafety } from "@/lib/riskRules";

interface EnrolmentWizardProps {
  lgas: { id: string; name: string }[];
  facilities: { id: string; name: string; lgaId: string }[];
}

export default function EnrolmentWizard({ lgas, facilities }: EnrolmentWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Consent
    consentGiven: false,
    // Step 2: Basic Info
    fullName: "",
    codedName: "",
    age: "",
    community: "",
    lgaId: "",
    facilityId: "",
    // Step 3: Contact & Safe Communication
    phone: "",
    alternatePhone: "",
    preferredLanguage: "HAUSA",
    preferredChannel: "VOICE",
    safeContactStatus: "DIRECT_SAFE",
    safeContactTime: "Morning (08:00 - 12:00)",
    ownsPhone: true,
    sharedPhone: false,
    sharedWith: "",
    safeForCalls: true,
    safeForSms: true,
    safeForWhatsapp: false,
    neutralMessagesOnly: false,
    unsafeTopics: "",
    // Step 4: Health Status
    pregnancyStatus: "NOT_PREGNANT",
    breastfeedingStatus: "NOT_BREASTFEEDING",
    caregiverStatus: false,
    childInOtp: false,
    childDischargedFromSc: false,
    // Step 5: Initial Screening
    hasInitialScreening: false,
    muacCm: "",
    oedema: false,
    visiblyWasted: false,
    appetiteConcern: false,
    householdFoodInsecurity: false,
  });

  // Derived filter for PHC dropdown based on LGA selection
  const filteredFacilities = facilities.filter(f => f.lgaId === formData.lgaId);

  // Auto-generate Coded Name if Full Name is left blank (for safety/anonymization demo)
  useEffect(() => {
    if (!formData.fullName) {
      const randomId = Math.floor(100 + Math.random() * 900);
      setFormData(prev => ({ ...prev, codedName: `ML-ANON-${randomId}` }));
    } else {
      setFormData(prev => ({ ...prev, codedName: "" }));
    }
  }, [formData.fullName]);

  // Handle simple input changes
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Classify risk dynamically for Step 6 preview
  const currentRisk = classifyNutritionRisk({
    muacCm: formData.muacCm ? parseFloat(formData.muacCm) : null,
    oedema: formData.oedema,
    visiblyWasted: formData.visiblyWasted,
    householdFoodInsecurity: formData.householdFoodInsecurity,
  });

  const nextStep = () => {
    if (step === 1 && !formData.consentGiven) {
      setError("Participant consent must be obtained to continue.");
      return;
    }
    if (step === 2) {
      if (!formData.age || !formData.community || !formData.lgaId || !formData.facilityId) {
        setError("Please fill in all required basic fields.");
        return;
      }
    }
    if (step === 3) {
      // If direct phone contact is selected, require phone number
      const needsPhone = ["DIRECT_SAFE", "NEUTRAL_ONLY"].includes(formData.safeContactStatus);
      if (needsPhone && !formData.phone) {
        setError("A phone number is required for direct digital contact options.");
        return;
      }
      if (formData.phone) {
        const isValid = /^(?:\+234|0)[789]\d{9}$/.test(formData.phone.trim());
        if (!isValid) {
          setError("Please enter a valid Nigerian phone number (e.g. +2348030000000 or 08030000000).");
          return;
        }
      }
      if (formData.alternatePhone) {
        const isValid = /^(?:\+234|0)[789]\d{9}$/.test(formData.alternatePhone.trim());
        if (!isValid) {
          setError("Please enter a valid alternate phone number (e.g. +2349030000000 or 09030000000).");
          return;
        }
      }
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/women", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      router.push("/women");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred during submission.");
      setLoading(false);
    }
  };

  const stepsLabel = [
    "Consent",
    "Demographics",
    "Safe Contact",
    "Maternal Status",
    "Screening",
    "Review & Actions",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Progress Indicators */}
      <div className="p-5 surface-card">
        <div className="flex justify-between items-center text-center">
          {stepsLabel.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isCurrent = stepNum === step;
            return (
              <div key={label} className="flex-1 flex flex-col items-center relative">
                {/* Connecting Line */}
                {idx > 0 && (
                  <div className={`absolute top-4 left-[-50%] right-[50%] h-[2px] z-[-1] ${
                    stepNum <= step ? "bg-emerald-600" : "bg-slate-200"
                  }`} />
                )}
                
                {/* Step Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  isCompleted 
                    ? "bg-emerald-600 border-emerald-600 text-white" 
                    : isCurrent 
                    ? "bg-emerald-50 border-emerald-600 text-emerald-700 font-bold" 
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}>
                  {isCompleted ? "✓" : stepNum}
                </div>
                <span className={`text-[10px] font-semibold uppercase mt-2 tracking-wider hidden sm:block ${
                  isCurrent ? "text-emerald-800 font-bold" : "text-slate-600"
                }`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="p-8 surface-card relative">
        {error && (
          <div className="flex gap-3 p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* STEP 1: CONSENT */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3.5 border-b border-slate-200 pb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <h3 className="text-lg font-bold text-slate-800">Participant Informed Consent</h3>
            </div>
            
            <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-sm space-y-3.5 leading-relaxed">
              <p className="font-semibold text-slate-800">Please read the following script to the participant:</p>
              <p className="italic">
                &ldquo;Muryar Uwa is a health and nutrition follow-up system designed by FRAD Foundation to support mothers and caregivers. If you consent, we will register you, ask you questions about your health, assess your safe communication preferences, and send health advice and clinic reminders to your phone. You can opt out at any time. We will keep your personal details secure.&rdquo;
              </p>
            </div>

            <div className="p-4 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Does the participant provide verbal informed consent?
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consentGiven}
                  onChange={(e) => updateField("consentGiven", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white" />
                <span className="ml-3 text-sm font-bold text-slate-600 peer-checked:text-emerald-700">
                  {formData.consentGiven ? "CONSENT GRANTED" : "NO CONSENT"}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: DEMOGRAPHICS */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Step 2: Basic Demographics</h3>
              <p className="text-xs text-slate-600 mt-1">If the name is sensitive, leave full name blank to generate an anonymized code.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="e.g. Amina Mustapha"
                  className="w-full px-4 py-2.5 glass-input text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Muryar Uwa ID / Coded Name
                </label>
                <input
                  type="text"
                  value={formData.fullName ? "Using Full Name" : formData.codedName}
                  disabled
                  className="w-full px-4 py-2.5 glass-input text-sm text-slate-500 bg-white/40 border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Age (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  placeholder="e.g. 26"
                  required
                  className="w-full px-4 py-2.5 glass-input text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Community / Settlement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.community}
                  onChange={(e) => updateField("community", e.target.value)}
                  placeholder="e.g. Muna Garage Sector 4"
                  required
                  className="w-full px-4 py-2.5 glass-input text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  LGA <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.lgaId}
                  onChange={(e) => {
                    updateField("lgaId", e.target.value);
                    updateField("facilityId", ""); // Reset facility when LGA changes
                  }}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 text-sm focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 cursor-pointer"
                >
                  <option value="">Select LGA</option>
                  {lgas.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Health Facility (PHC Link) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.facilityId}
                  onChange={(e) => updateField("facilityId", e.target.value)}
                  disabled={!formData.lgaId}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 text-sm focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select PHC</option>
                  {filteredFacilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONTACT & SAFE COMMUNICATION */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Step 3: Safe Contact Preferences</h3>
                <p className="text-xs text-slate-600 mt-1">Determine safe times, devices, and safeguarding categories.</p>
              </div>
              <Phone className="w-5 h-5 text-emerald-700" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Primary Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="e.g. +2348012345678"
                  className="w-full px-4 py-2.5 glass-input text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Alternative Phone (Family/Neighbor)
                </label>
                <input
                  type="text"
                  value={formData.alternatePhone}
                  onChange={(e) => updateField("alternatePhone", e.target.value)}
                  placeholder="e.g. +2349012345678"
                  className="w-full px-4 py-2.5 glass-input text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Safe Contact Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.safeContactStatus}
                  onChange={(e) => {
                    const status = e.target.value;
                    updateField("safeContactStatus", status);
                    // Autofill phone preferences for safety
                    if (status === "NO_DIRECT_CONTACT" || status === "MOBILIZER_ONLY") {
                      updateField("ownsPhone", false);
                      updateField("sharedPhone", false);
                      updateField("safeForCalls", false);
                      updateField("safeForSms", false);
                      updateField("safeForWhatsapp", false);
                      updateField("preferredChannel", "MOBILIZER");
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 text-sm focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 cursor-pointer"
                >
                  <option value="DIRECT_SAFE">Direct Safe (Calls/SMS/WhatsApp allowed)</option>
                  <option value="NEUTRAL_ONLY">Neutral Only (Generic reminders only)</option>
                  <option value="MOBILIZER_ONLY">Mobilizer Only (Assign community worker)</option>
                  <option value="NO_DIRECT_CONTACT">No Phone Contact (Unreachable / Unsafe)</option>
                  <option value="OPTED_OUT">Opted Out (No contact of any form)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Preferred Delivery Channel
                </label>
                <select
                  value={formData.preferredChannel}
                  onChange={(e) => updateField("preferredChannel", e.target.value)}
                  disabled={["MOBILIZER_ONLY", "NO_DIRECT_CONTACT"].includes(formData.safeContactStatus)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 text-sm focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 cursor-pointer"
                >
                  <option value="VOICE">Voice Call (Recommended for low literacy)</option>
                  <option value="IVR">Interactive Voice Response (IVR)</option>
                  <option value="SMS">Standard SMS</option>
                  <option value="WHATSAPP_VOICE">WhatsApp Voice Note</option>
                  <option value="MOBILIZER">Mobilizer Assisted Outreach</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Preferred Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => updateField("preferredLanguage", e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 text-sm focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 cursor-pointer"
                >
                  <option value="HAUSA">Hausa</option>
                  <option value="KANURI">Kanuri</option>
                  <option value="FULFULDE">Fulfulde</option>
                  <option value="ENGLISH">English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Safest Contact Time
                </label>
                <input
                  type="text"
                  value={formData.safeContactTime}
                  onChange={(e) => updateField("safeContactTime", e.target.value)}
                  placeholder="e.g. Morning (08:00 - 12:00)"
                  className="w-full px-4 py-2.5 glass-input text-sm text-slate-800"
                />
              </div>
            </div>

            {/* Phone Ownership detail (only visible if contact is direct) */}
            {!["NO_DIRECT_CONTACT", "OPTED_OUT"].includes(formData.safeContactStatus) && (
              <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Device Accessibility Check</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.ownsPhone}
                      onChange={(e) => {
                        updateField("ownsPhone", e.target.checked);
                        if (e.target.checked) updateField("sharedPhone", false);
                      }}
                      className="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                    />
                    <span>Owns Phone</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.sharedPhone}
                      onChange={(e) => {
                        updateField("sharedPhone", e.target.checked);
                        if (e.target.checked) updateField("ownsPhone", false);
                      }}
                      className="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                    />
                    <span>Shares Phone</span>
                  </label>

                  <div className="min-w-[150px]">
                    <input
                      type="text"
                      value={formData.sharedWith}
                      onChange={(e) => updateField("sharedWith", e.target.value)}
                      placeholder="Shared with who? (e.g. Husband)"
                      disabled={!formData.sharedPhone}
                      className="w-full px-3 py-1.5 glass-input text-xs text-slate-800 disabled:opacity-30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.safeForCalls}
                      onChange={(e) => updateField("safeForCalls", e.target.checked)}
                      className="rounded bg-white border-slate-300 text-emerald-600"
                    />
                    <span className="text-xs">Safe for Calls</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.safeForSms}
                      onChange={(e) => updateField("safeForSms", e.target.checked)}
                      className="rounded bg-white border-slate-300 text-emerald-600"
                    />
                    <span className="text-xs">Safe for SMS</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.safeForWhatsapp}
                      onChange={(e) => updateField("safeForWhatsapp", e.target.checked)}
                      className="rounded bg-white border-slate-300 text-emerald-600"
                    />
                    <span className="text-xs">Safe for WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.neutralMessagesOnly}
                      onChange={(e) => updateField("neutralMessagesOnly", e.target.checked)}
                      className="rounded bg-white border-slate-300 text-emerald-600"
                    />
                    <span className="text-xs">Neutral Only</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: HEALTH / MATERNAL STATUS */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Step 4: Maternal & Caregiver Status</h3>
              <p className="text-xs text-slate-600 mt-1">Determine health follow-up needs and eligibility for support.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Pregnancy Status
                </label>
                <select
                  value={formData.pregnancyStatus}
                  onChange={(e) => updateField("pregnancyStatus", e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 text-sm focus:outline-none"
                >
                  <option value="NOT_PREGNANT">Not Pregnant</option>
                  <option value="PREGNANT">Pregnant</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Breastfeeding Status
                </label>
                <select
                  value={formData.breastfeedingStatus}
                  onChange={(e) => updateField("breastfeedingStatus", e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 text-sm focus:outline-none"
                >
                  <option value="NOT_BREASTFEEDING">Not Breastfeeding</option>
                  <option value="BREASTFEEDING">Breastfeeding</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Caregiver status flags</h4>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.caregiverStatus}
                    onChange={(e) => updateField("caregiverStatus", e.target.checked)}
                    className="rounded bg-white border-slate-300 text-emerald-600 w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-semibold">Primary Caregiver of child under 5</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Mother or key caregiver responsible for the infant's feeding.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.childInOtp}
                    onChange={(e) => updateField("childInOtp", e.target.checked)}
                    className="rounded bg-white border-slate-300 text-emerald-600 w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-semibold">Child is enrolled in Outpatient Therapeutic Program (OTP)</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Currently undergoing treatment for Severe Acute Malnutrition (SAM).</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.childDischargedFromSc}
                    onChange={(e) => updateField("childDischargedFromSc", e.target.checked)}
                    className="rounded bg-white border-slate-300 text-emerald-600 w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-semibold">Child was discharged from Stabilization Center (SC)</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Recently stepped down from inpatient SAM intensive care.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: INITIAL SCREENING */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Step 5: Initial Nutrition Screening</h3>
                <p className="text-xs text-slate-600 mt-1">Screen the mother's nutritional status directly at clinic enrolment.</p>
              </div>
              <Activity className="w-5 h-5 text-emerald-700" />
            </div>

            <div className="p-4 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Log initial screening results now?
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasInitialScreening}
                  onChange={(e) => updateField("hasInitialScreening", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white" />
                <span className="ml-3 text-sm font-bold text-slate-600 peer-checked:text-emerald-700">
                  {formData.hasInitialScreening ? "LOG SCREENING" : "SKIP SCREENING"}
                </span>
              </label>
            </div>

            {formData.hasInitialScreening && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-lg bg-slate-50 border border-slate-200 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    MUAC Reading (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.muacCm}
                    onChange={(e) => updateField("muacCm", e.target.value)}
                    placeholder="e.g. 21.4"
                    className="w-full px-4 py-2.5 glass-input text-sm text-slate-800"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Use red/yellow/green tape measurement.</p>
                </div>

                <div className="flex flex-col justify-end gap-3.5 pb-2">
                  <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.oedema}
                      onChange={(e) => updateField("oedema", e.target.checked)}
                      className="rounded bg-white border-slate-300 text-emerald-600"
                    />
                    <div>
                      <span className="text-sm font-semibold">Bilateral Pitting Oedema</span>
                      <span className="ml-2 inline-block px-1.5 py-0.2 rounded bg-red-50 text-red-700 text-[8px] font-bold">URGENT ALERT</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.visiblyWasted}
                      onChange={(e) => updateField("visiblyWasted", e.target.checked)}
                      className="rounded bg-white border-slate-300 text-emerald-600"
                    />
                    <span className="text-sm font-semibold">Visibly Wasted</span>
                  </label>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.appetiteConcern}
                      onChange={(e) => updateField("appetiteConcern", e.target.checked)}
                      className="rounded bg-white border-slate-300 text-emerald-600"
                    />
                    <span className="text-sm font-semibold">Appetite Concern / Poor Intake</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.householdFoodInsecurity}
                      onChange={(e) => updateField("householdFoodInsecurity", e.target.checked)}
                      className="rounded bg-white border-slate-300 text-emerald-600"
                    />
                    <span className="text-sm font-semibold">Household Food Insecurity Concerns</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: CONFIRMATION & REVIEW */}
        {step === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Step 6: Review & Actions</h3>
              <p className="text-xs text-slate-600 mt-1">Review the enrolment data and triggered automated outreach plans.</p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Participant Details</h4>
                <p><span className="text-slate-600">Name:</span> <span className="font-semibold text-slate-800">{formData.fullName || `${formData.codedName} (Anonymized)`}</span></p>
                <p><span className="text-slate-600">Age:</span> <span className="text-slate-800">{formData.age} yrs</span></p>
                <p><span className="text-slate-600">LGA/Facility:</span> <span className="text-slate-800">{lgas.find(l=>l.id===formData.lgaId)?.name} / {facilities.find(f=>f.id===formData.facilityId)?.name}</span></p>
                <p><span className="text-slate-600">Settlement:</span> <span className="text-slate-800">{formData.community}</span></p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Contact & Safety</h4>
                <p><span className="text-slate-600">Safe Status:</span> <span className="font-semibold text-emerald-700">{formData.safeContactStatus.replace("_", " ")}</span></p>
                <p><span className="text-slate-600">Channel/Language:</span> <span className="text-slate-800">{formData.preferredChannel} / {formData.preferredLanguage}</span></p>
                <p><span className="text-slate-600">Phone:</span> <span className="text-slate-800 font-mono">{formData.phone || "No phone number"}</span></p>
                <p><span className="text-slate-600">Safe Time:</span> <span className="text-slate-800">{formData.safeContactTime}</span></p>
              </div>
            </div>

            {/* Risk Assessment & Automatic Triggers */}
            <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Automated Risk & Safety Classification</h4>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 text-sm font-semibold">Nutrition Category:</span>
                  <span className={`status-pill ${
                    currentRisk === "URGENT_REFERRAL" 
                      ? "bg-red-50 text-red-700 border border-red-200" 
                      : ["SEVERE_CONCERN", "MODERATE_CONCERN"].includes(currentRisk)
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : currentRisk === "AT_RISK"
                      ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {currentRisk.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-600 text-sm font-semibold">Message Deliverable:</span>
                  <span className={`status-pill ${
                    formData.safeContactStatus === "OPTED_OUT"
                      ? "bg-slate-100 text-slate-600 border border-slate-200"
                      : ["NO_DIRECT_CONTACT", "MOBILIZER_ONLY"].includes(formData.safeContactStatus)
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {formData.safeContactStatus === "OPTED_OUT" 
                      ? "BLOCKED" 
                      : ["NO_DIRECT_CONTACT", "MOBILIZER_ONLY"].includes(formData.safeContactStatus)
                      ? "MOBILIZER ASSIGNED"
                      : "ENABLED"}
                  </span>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="pt-3 border-t border-slate-200">
                <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Recommended Next Actions</h5>
                <ul className="space-y-1.5">
                  {getRecommendedActions(currentRisk).map((act, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                  {["NO_DIRECT_CONTACT", "MOBILIZER_ONLY"].includes(formData.safeContactStatus) && (
                    <li className="flex items-start gap-2 text-xs text-amber-700 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Phone unreachable or unsafe. Directing outreach and scheduler to nutrition mobilizer follow-up.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200/60">
          <button
            onClick={prevStep}
            disabled={step === 1 || loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-800 text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < 6 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all cursor-pointer"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all cursor-pointer  disabled:opacity-50"
            >
              {loading ? "Registering..." : "Complete Enrolment"}
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
