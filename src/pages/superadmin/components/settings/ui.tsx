import React from "react";

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

export function Input({
  label,
  value,
  onChange,
  required,
  type,
  placeholder,
  right,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          type={type ?? "text"}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
        />
        {right}
      </div>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          "h-7 w-12 rounded-full border transition relative",
          checked ? "bg-sky-600 border-sky-600" : "bg-white border-slate-200",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
            checked ? "left-5" : "left-0.5",
          ].join(" ")}
        />
      </button>
    </label>
  );
}

export function Tag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "default" | "sky" | "emerald" | "amber" | "red";
}) {
  const cls =
    tone === "sky"
      ? "border-sky-100 bg-sky-50 text-sky-700"
      : tone === "emerald"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : tone === "amber"
      ? "border-amber-100 bg-amber-50 text-amber-700"
      : tone === "red"
      ? "border-red-100 bg-red-50 text-red-700"
      : "border-slate-100 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

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
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">{title}</div>
            {subtitle && <div className="mt-1 text-sm text-slate-600">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
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

export function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  danger,
  disabled,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmText: string;
  danger?: boolean;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="text-lg font-semibold text-slate-900">{title}</div>
        </div>

        <div className="px-6 py-5 text-sm text-slate-700">{message}</div>

        <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60",
              danger ? "bg-red-600 hover:bg-red-500" : "bg-sky-600 hover:bg-sky-500",
            ].join(" ")}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Tiny toast */
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
