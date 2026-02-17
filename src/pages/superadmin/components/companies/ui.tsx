import React from "react";

/* ------------------ Card ------------------ */
export function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/* ------------------ Tag ------------------ */
export function Tag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "default" | "sky";
}) {
  const cls =
    tone === "sky"
      ? "border-sky-100 bg-sky-50 text-sky-700"
      : "border-slate-100 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

/* ------------------ Input ------------------ */
export function Input({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
      />
    </div>
  );
}

/* ------------------ Select ------------------ */
export function Select({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------ Modal ------------------ */
export function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">{title}</div>
            {subtitle && <div className="mt-1 text-sm text-slate-600">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ------------------ Toast ------------------ */
export function toast(msg: string, isError?: boolean) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.className = [
    "fixed z-[9999] left-1/2 top-6 -translate-x-1/2",
    "rounded-xl px-4 py-2 text-sm font-semibold shadow-lg border",
    isError
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200",
  ].join(" ");
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}
