import React from "react";

export default function EmptyState({
  title,
  description,
  actionText,
  onAction,
}: {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-700 font-bold">
        ✦
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>

      <button
        onClick={onAction}
        className="mt-5 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
        type="button"
      >
        {actionText}
      </button>
    </div>
  );
}
