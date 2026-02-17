// src/components/ui/ConfirmModal.tsx
import React from "react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  onCancel,
  onConfirm,
  danger,
  disabled,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  danger?: boolean;
  disabled?: boolean;
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
            disabled={disabled}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
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
