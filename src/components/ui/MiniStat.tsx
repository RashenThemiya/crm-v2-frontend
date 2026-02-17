import React from "react";

export default function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-sky-50 px-4 py-3">
      <div className="text-[11px] font-semibold text-slate-600">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
