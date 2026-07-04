"use client";

import React from "react";
import { Lock, MapPin } from "lucide-react";

interface LGA {
  id: string;
  name: string;
}

interface Facility {
  id: string;
  name: string;
  lgaId: string;
}

interface DashboardFiltersProps {
  lgas: LGA[];
  facilities: Facility[];
  selectedLgaId: string;
  selectedFacilityId: string;
  currentUserRole: string;
}

export default function DashboardFilters({
  lgas,
  facilities,
  selectedLgaId,
  selectedFacilityId,
  currentUserRole,
}: DashboardFiltersProps) {
  const canChooseLga = ["ADMIN", "PHC_BOARD_VIEWER"].includes(currentUserRole);
  const canChooseFacility = ["ADMIN", "SUPERVISOR", "PHC_BOARD_VIEWER"].includes(currentUserRole);
  const scopedLabel = facilities.length === 1 ? facilities[0].name : lgas.length === 1 ? `${lgas[0].name} LGA` : "Your assigned caseload";

  // Filter facilities based on selected LGA
  const filteredFacilities = selectedLgaId
    ? facilities.filter((f) => f.lgaId === selectedLgaId)
    : facilities;

  const handleLgaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("lgaId", value);
      url.searchParams.delete("facilityId"); // Clear facility on LGA change
    } else {
      url.searchParams.delete("lgaId");
      url.searchParams.delete("facilityId");
    }
    window.location.href = url.pathname + url.search;
  };

  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("facilityId", value);
    } else {
      url.searchParams.delete("facilityId");
    }
    window.location.href = url.pathname + url.search;
  };

  return (
    <form className="surface-card flex flex-wrap items-center gap-3 p-3">
      <div className="flex items-center gap-2 px-1 text-xs font-bold text-slate-600">
        <MapPin className="h-3.5 w-3.5 text-slate-500" />
        <span>Filter view</span>
      </div>

      {canChooseLga && (
        <select
          name="lgaId"
          value={selectedLgaId}
          onChange={handleLgaChange}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
        >
          <option value="">All LGAs</option>
          {lgas.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      )}

      {canChooseFacility && (
        <select
          name="facilityId"
          value={selectedFacilityId}
          onChange={handleFacilityChange}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100"
        >
          <option value="">All Facilities</option>
          {filteredFacilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      )}

      {!canChooseLga && !canChooseFacility && (
        <div className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-800">
          <Lock className="h-3.5 w-3.5" />
          {scopedLabel}
        </div>
      )}

      {(selectedLgaId || selectedFacilityId) && (
        <a
          href="/dashboard"
          className="rounded-md px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        >
          Reset Filters
        </a>
      )}
    </form>
  );
}
