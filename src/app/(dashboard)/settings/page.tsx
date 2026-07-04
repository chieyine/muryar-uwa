import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  User,
  Shield,
  MapPin,
  Mail,
  Activity,
  Star,
  Lock,
  Globe
} from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch full user details
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      facility: true,
      lga: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const getRoleRights = (role: string) => {
    switch (role) {
      case "ADMIN":
        return [
          "Create and manage LGAs and Health Facilities",
          "Register and suspend staff user accounts",
          "Add or toggle system outreach templates",
          "Access full database metrics & reports",
        ];
      case "SUPERVISOR":
        return [
          "Access analytical monitoring dashboards",
          "View full participant directory lists",
          "Export CSV monitoring data summaries",
          "Assign outreach tasks to community mobilizers",
          "Force close / approve referral escalations",
        ];
      case "CHEW":
        return [
          "Enrol new participants via multi-step wizard",
          "Log safe contact assessments and phone settings",
          "Conduct and save initial nutrition screenings",
          "Create clinic and nutrition referrals",
          "Record Tom Brown/seedling resilience support",
        ];
      case "MIDWIFE":
        return [
          "Track ANC and PNC clinic follow-ups",
          "Provide maternal nutrition and danger signs counseling",
          "Log nutrition screenings and refer for OTP/SC admissions",
        ];
      case "MOBILIZER":
        return [
          "Conduct household outreach home visits",
          "Trace missed clinic appointments",
          "Update status outcomes for assigned field tasks",
          "Co-facilitate seedling distributions & sack gardens",
        ];
      case "PHC_BOARD_VIEWER":
      default:
        return [
          "Access high-level aggregate dashboard charts",
          "Export CSV summary statistics reports",
          "Read-only lookup for clinic performance ranks",
        ];
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-xs md:text-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Account & Security Settings</h2>
        <p className="text-sm text-slate-600">
          Manage your personal profile and inspect system permissions assigned to your role.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Profile Info */}
        <div className="md:col-span-7 p-6 rounded-2xl glass-panel space-y-5">
          <div className="flex items-center gap-3.5 border-b border-slate-200 pb-3">
            <User className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Profile Information</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm">
                {user.fullName.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <span className="text-slate-600 text-xs font-medium block">Full Name</span>
                <span className="font-semibold text-slate-950">{user.fullName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Email Address</span>
                  <span className="text-slate-700 font-medium">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">System Role</span>
                  <span className="status-pill bg-emerald-50 text-emerald-700 text-[10px] py-0.5 mt-0.5">{user.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Assigned PHC/LGA</span>
                  <span className="text-slate-700 font-medium">
                    {user.facility ? user.facility.name : user.lga ? `${user.lga.name} LGA` : "State-wide HQ"}
                  </span>
                </div>
              </div>

              {user.facility && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">PHC Connectivity</span>
                    <span className="text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                      {user.facility.hasStarlink ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                          Starlink Active
                        </>
                      ) : (
                        "Standard Cellular"
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Role Permissions Audit */}
        <div className="md:col-span-5 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-3.5 border-b border-slate-200 pb-3">
            <Lock className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Role Permissions</h3>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] text-slate-600 font-bold tracking-wide uppercase">
              Authorizations for {user.role}:
            </span>
            <ul className="space-y-2">
              {getRoleRights(user.role).map((right, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <Star className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <span>{right}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
