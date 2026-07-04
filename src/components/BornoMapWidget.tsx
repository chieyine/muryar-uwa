"use client";

import React from "react";
import { MapPin, Users, Heart, AlertTriangle, ChevronRight } from "lucide-react";

interface LgaData {
  id: string;
  name: string;
  count: number;
  openReferrals: number;
  lowMuacAlerts: number;
}

interface MapWidgetProps {
  lgas: LgaData[];
  selectedLgaId?: string;
}

export default function BornoMapWidget({ lgas, selectedLgaId }: MapWidgetProps) {
  const handleLgaClick = (lgaId: string) => {
    const url = new URL(window.location.href);
    if (selectedLgaId === lgaId) {
      url.searchParams.delete("lgaId");
    } else {
      url.searchParams.set("lgaId", lgaId);
    }
    url.searchParams.delete("facilityId"); // Clear facility on LGA change
    window.location.href = url.pathname + url.search;
  };

  return (
    <div className="surface-card p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span>LGA Sectors Map</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Select an LGA to filter nutrition, referral, and enrolment indicators.
          </p>
        </div>
        {selectedLgaId && (
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete("lgaId");
              url.searchParams.delete("facilityId");
              window.location.href = url.pathname + url.search;
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Clear Map Filter
          </button>
        )}
      </div>

      {/* Grid Layout representing sectors map */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {lgas.map((lga) => {
          const isSelected = selectedLgaId === lga.id;
          return (
            <div
              key={lga.id}
              onClick={() => handleLgaClick(lga.id)}
              className={`relative flex min-h-[132px] cursor-pointer flex-col justify-between rounded-lg border p-4 transition group ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? "text-emerald-800" : "text-slate-600"} transition-colors`}>
                    {lga.name}
                  </span>
                  <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-emerald-700" : "text-slate-600"}`} />
                </div>
                <h4 className="mt-3 flex items-baseline gap-1.5 text-2xl font-bold text-slate-950">
                  {lga.count}
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Mothers</span>
                </h4>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[10px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-500" />
                  <span>{lga.openReferrals} Refs</span>
                </div>
                {lga.lowMuacAlerts > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{lga.lowMuacAlerts} Alert</span>
                  </div>
                )}
              </div>

              {/* Decorative side hover hint */}
              <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
