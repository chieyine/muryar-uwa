"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";

interface ChartProps {
  phcEnrolments: { name: string; count: number }[];
  referralStatus: { name: string; count: number }[];
  nutritionRisk: { name: string; count: number }[];
  channelDistribution: { name: string; count: number }[];
  languageDistribution: { name: string; count: number }[];
  safeContactCategory: { name: string; count: number }[];
  openReferralsByType: { name: string; count: number }[];
}

const COLORS = ["#059669", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#ea580c", "#475569", "#0d9488", "#b45309"];

export default function DashboardCharts({
  phcEnrolments,
  referralStatus,
  nutritionRisk,
  channelDistribution,
  languageDistribution,
  safeContactCategory,
  openReferralsByType,
}: ChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px] animate-pulse">
        <div className="h-96 surface-card-muted" />
        <div className="h-96 surface-card-muted" />
      </div>
    );
  }

  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      borderRadius: "8px",
      color: "#0f172a",
      fontSize: "11px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    },
  };

  const PieLegend = ({ data, colorOffset = 0 }: { data: { name: string; count: number }[]; colorOffset?: number }) => (
    <div className="w-full sm:w-1/2 flex flex-col gap-2.5 px-4">
      {data.map((item, idx) => (
        <div key={item.name} className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[(idx + colorOffset) % COLORS.length] }}
            />
            <span className="font-medium text-xs uppercase tracking-wide">{item.name}</span>
          </div>
          <span className="font-bold text-slate-800">{item.count}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Row 1: Enrolment by PHC & Nutrition Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolment by PHC */}
        <div className="surface-card p-5">
          <h3 className="section-title mb-5">Enrolment by Health Facility</h3>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phcEnrolments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nutrition Risk Category */}
        <div className="surface-card p-5">
          <h3 className="section-title mb-5">Maternal Nutrition Screening Levels</h3>
          <div className="h-80 w-full text-xs flex flex-col sm:flex-row items-center justify-center">
            <div className="h-64 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutritionRisk}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {nutritionRisk.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <PieLegend data={nutritionRisk} />
          </div>
        </div>
      </div>

      {/* Row 2: Referral Status Summary & Message Channel Preference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Status */}
        <div className="surface-card p-5">
          <h3 className="section-title mb-5">Referral Status Tracking</h3>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={referralStatus} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis type="number" stroke="#94a3b8" tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tickLine={false} width={100} />
                <Tooltip {...customTooltipStyle} />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} maxBarSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Message Delivery Preferences */}
        <div className="surface-card p-5">
          <h3 className="section-title mb-5">Preferred Communication Channels</h3>
          <div className="h-80 w-full text-xs flex flex-col sm:flex-row items-center justify-center">
            <div className="h-64 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {channelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <PieLegend data={channelDistribution} colorOffset={3} />
          </div>
        </div>
      </div>

      {/* Row 3: Language Distribution & Safe Contact Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preferred Language */}
        <div className="surface-card p-5">
          <h3 className="section-title mb-5">Women by Preferred Language</h3>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safe Contact Category */}
        <div className="surface-card p-5">
          <h3 className="section-title mb-5">Safe Contact Status Categories</h3>
          <div className="h-80 w-full text-xs flex flex-col sm:flex-row items-center justify-center">
            <div className="h-64 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safeContactCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {safeContactCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <PieLegend data={safeContactCategory} colorOffset={5} />
          </div>
        </div>
      </div>

      {/* Row 4: Open Referrals by Type */}
      {openReferralsByType.length > 0 && (
        <div className="surface-card p-5">
          <h3 className="section-title mb-5">Open Referrals by Type</h3>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={openReferralsByType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
