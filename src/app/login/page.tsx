"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Lock, Mail, ArrowRight, UserCheck, ShieldAlert } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { name: "FRAD Supervisor", email: "supervisor@muryaruwa.org", role: "Supervisor" },
    { name: "CHEW Muna", email: "chew.muna@muryaruwa.org", role: "CHEW (frontline app)" },
    { name: "Midwife Muna", email: "midwife.muna@muryaruwa.org", role: "Midwife (frontline app)" },
    { name: "Mobilizer Jere", email: "mobilizer.jere@muryaruwa.org", role: "Mobilizer (field follow-up)" },
    { name: "PHC Board Reviewer", email: "board@muryaruwa.org", role: "PHC Board (aggregated info)" },
    { name: "Admin", email: "admin@muryaruwa.org", role: "System Administrator" },
  ];

  return (
    <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
      {/* Brand & Mission Description Column */}
      <div className="surface-card flex flex-col justify-between p-8 lg:col-span-5">
        <div>
          <div className="flex items-center gap-3.5 mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Heart className="w-6 h-6 fill-emerald-600/10" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none text-slate-950">
                Muryar Uwa
              </h1>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-emerald-700">Staff Portal</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Prototype Demo
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              This is a simulated demonstration of the proposed Muryar Uwa platform. It contains no real participant data and is intended to show the planned user journey and dashboard workflows.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Developed by</span>
          <span className="text-sm font-bold text-slate-700">FRAD Foundation</span>
        </div>
      </div>

      {/* Credentials Form & Shortcuts Column */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Main Login Card */}
        <div className="surface-card relative overflow-hidden p-8">
          <p className="section-kicker">Secure access</p>
          <h3 className="mt-1 mb-6 text-xl font-bold text-slate-950">Staff sign in</h3>

          {error && (
            <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@muryaruwa.org"
                  className="w-full pl-10 pr-4 py-2.5 glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 glass-input text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Quick Login Section */}
        <div className="surface-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Grant Reviewer Shortcuts (Quick Sign-In)
            </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLogins.map((ql) => (
              <button
                key={ql.email}
                onClick={() => performLogin(ql.email, "password123")}
                disabled={loading}
                className="group flex cursor-pointer flex-col items-start rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-left transition hover:border-emerald-300 hover:bg-white"
              >
                <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                  {ql.name}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Role: {ql.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-1 flex-col items-center justify-center bg-slate-50 p-6 md:p-12">
      <Suspense fallback={
        <div className="surface-card w-full max-w-sm space-y-4 p-8 text-center">
          <Heart className="w-8 h-8 text-emerald-600 animate-pulse mx-auto" />
          <p className="text-slate-600 text-xs font-bold">Loading Muryar Uwa Portal...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
