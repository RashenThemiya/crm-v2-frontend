import React from "react";
import type { TicketStage } from "../../../../api/ticketStage.api";

export type SelectOption = { value: string | number; label: string };

export type SelectProps = {
  label: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: string) => void;
};

export type TabBtnProps = { active: boolean; onClick: () => void; children: React.ReactNode };
export type SectionProps = { title: string; children: React.ReactNode; right?: React.ReactNode };
export type InfoProps = { label: string; value: string };

export function safeSortStages(stages: TicketStage[]) {
  return (stages ?? []).slice().sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));
}

export function noteStageIdOf(n: any): number | null {
  return (n?.stageId ?? n?.ticketStageId ?? null) as number | null;
}

export function meetingStageIdOf(m: any): number | null {
  return (m?.stageId ?? m?.ticketStageId ?? null) as number | null;
}

export function toDatetimeLocalValueFromUtc(utcIso: string) {
  const d = new Date(utcIso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function datetimeLocalToUtcIso(localValue: string) {
  const d = new Date(localValue);
  return d.toISOString();
}

export function participantLabel(p: any) {
  if (!p) return "—";
  if (p.participantType === "ADMIN") return p.adminUsername ?? `Admin#${p.adminId ?? "?"}`;
  if (p.participantType === "COMPANY_CONTACT") return p.companyContactName ?? `Contact#${p.companyContactPersonId ?? "?"}`;
  return p.name ?? p.email ?? p.phoneNumber ?? "External";
}

export function TabBtn({ active, onClick, children }: TabBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl px-4 py-2 text-sm font-semibold",
        active ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function Section({ title, children, right }: SectionProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-slate-900">{title}</div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function Info({ label, value }: InfoProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3">
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900 truncate">{value}</div>
    </div>
  );
}

export function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
      <div className="text-[11px] font-semibold text-slate-600">{label}</div>
      <select
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function StagePill({
  active,
  onClick,
  label,
  meta,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  meta?: string;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-left rounded-2xl border px-3 py-2 min-w-[150px]",
        active ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
        highlight ? "ring-2 ring-sky-200" : "",
      ].join(" ")}
    >
      <div className="text-sm font-semibold text-slate-900 truncate">{label}</div>
      {meta ? <div className="text-[11px] text-slate-500 mt-0.5">{meta}</div> : null}
    </button>
  );
}
