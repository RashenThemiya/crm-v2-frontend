import React from "react";

export default function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
