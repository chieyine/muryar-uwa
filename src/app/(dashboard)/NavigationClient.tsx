"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  MessageSquare,
  Sprout,
  AlertTriangle,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  Heart,
  MapPin,
  Shield,
  User
} from "lucide-react";
import { JWTPayload } from "@/lib/auth";

interface NavigationClientProps {
  user: JWTPayload;
  children: React.ReactNode;
}

export default function NavigationClient({ user, children }: NavigationClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "SUPERVISOR", "CHEW", "MIDWIFE", "MOBILIZER", "PHC_BOARD_VIEWER"],
    },
    {
      name: "Women Directory",
      href: "/women",
      icon: Users,
      roles: ["ADMIN", "SUPERVISOR", "CHEW", "MIDWIFE", "MOBILIZER"],
    },
    {
      name: "New Enrolment",
      href: "/women/new",
      icon: UserPlus,
      roles: ["ADMIN", "CHEW", "MIDWIFE"],
    },
    {
      name: "Referral Tracker",
      href: "/referrals",
      icon: ClipboardList,
      roles: ["ADMIN", "SUPERVISOR", "CHEW", "MIDWIFE", "MOBILIZER"],
    },
    {
      name: "Messages Queue",
      href: "/messages",
      icon: MessageSquare,
      roles: ["ADMIN", "SUPERVISOR", "CHEW", "MIDWIFE", "MOBILIZER"],
    },
    {
      name: "Nutrition Resilience",
      href: "/nutrition-resilience",
      icon: Sprout,
      roles: ["ADMIN", "SUPERVISOR", "CHEW", "MIDWIFE", "MOBILIZER"],
    },
    {
      name: "Missed Visits",
      href: "/missed-visits",
      icon: AlertTriangle,
      roles: ["ADMIN", "SUPERVISOR", "CHEW", "MIDWIFE", "MOBILIZER"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileSpreadsheet,
      roles: ["ADMIN", "SUPERVISOR", "PHC_BOARD_VIEWER"],
    },
    {
      name: "System Admin",
      href: "/admin",
      icon: Shield,
      roles: ["ADMIN"],
    },
    {
      name: "Account Settings",
      href: "/settings",
      icon: User,
      roles: ["ADMIN", "SUPERVISOR", "CHEW", "MIDWIFE", "MOBILIZER", "PHC_BOARD_VIEWER"],
    },
  ];

  const allowedNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div className="flex w-full h-full overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
            <Heart className="w-5 h-5 fill-emerald-600/10" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-slate-950">
              Muryar Uwa
            </h1>
            <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-emerald-700">Staff Portal</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 shadow-[inset_3px_0_0_#047857]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-emerald-600" : "text-slate-600"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-sm font-bold text-emerald-800">
              {user.fullName.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-slate-800">
                {user.fullName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-semibold">
                <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100/60 text-emerald-800 font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:text-slate-800 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-500">
              <MapPin className="h-3 w-3 text-slate-500" />
              <span>Maternal Health Portal</span>
              {user.facilityId && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="text-emerald-800">Assigned PHC</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-[11px] text-slate-500 font-medium">
              <span className="text-slate-800 font-bold">{user.fullName}</span>
              <span>{user.email}</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
              <Shield className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-slate-50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white border-r border-slate-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Heart className="w-4 h-4 fill-emerald-600/10" />
                  </div>
                  <span className="font-bold text-slate-950">Muryar Uwa</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {allowedNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800 shadow-[inset_3px_0_0_#047857]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3 px-2 py-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 text-sm font-bold text-emerald-700">
                    {user.fullName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="truncate text-xs font-bold text-slate-800">{user.fullName}</p>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-1 py-0.5 rounded">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
