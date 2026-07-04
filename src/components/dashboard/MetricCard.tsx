import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  detail: ReactNode;
  icon: LucideIcon;
  tone?: "green" | "blue" | "amber" | "red" | "slate";
}

const toneClasses = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "slate",
}: MetricCardProps) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="section-kicker">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
        {detail}
      </div>
    </div>
  );
}
