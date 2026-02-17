// ✅ FIX: update YOUR StatCard props type to include `icon` and `sub`
// File: src/pages/super/components/StatCard.tsx  (path may differ in your project)

import React from "react";

export type StatCardTone = "indigo" | "sky" | "amber" | "emerald";

export type StatCardProps = {
  title: React.ReactNode;          // ✅ string OR JSX
  value: number | string;
  tone: StatCardTone;

  icon?: React.ReactNode;          // ✅ NEW
  sub?: React.ReactNode;           // ✅ NEW
};

export default function StatCard({ title, value, tone, icon, sub }: StatCardProps) {
  const toneClasses: Record<
    StatCardTone,
    { ring: string; bg: string; text: string; badge: string }
  > = {
    indigo: {
      ring: "ring-indigo-100",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      badge: "bg-indigo-50 text-indigo-700",
    },
    sky: {
      ring: "ring-sky-100",
      bg: "bg-sky-50",
      text: "text-sky-700",
      badge: "bg-sky-50 text-sky-700",
    },
    amber: {
      ring: "ring-amber-100",
      bg: "bg-amber-50",
      text: "text-amber-700",
      badge: "bg-amber-50 text-amber-700",
    },
    emerald: {
      ring: "ring-emerald-100",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      badge: "bg-emerald-50 text-emerald-700",
    },
  };

  const t = toneClasses[tone];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-700 truncate">{title}</div>
          {sub ? <div className="mt-1 text-xs text-slate-500 truncate">{sub}</div> : null}
        </div>

        {icon ? (
          <div className={["shrink-0 rounded-xl p-2 ring-1", t.bg, t.ring, t.text].join(" ")}>
            {icon}
          </div>
        ) : null}
      </div>

      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
