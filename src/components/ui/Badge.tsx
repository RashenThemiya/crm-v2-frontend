import React from "react";

export default function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "default" | "soft";
}) {
  const cls =
    tone === "soft"
      ? "bg-slate-50 text-slate-700 border-slate-100"
      : "bg-sky-50 text-sky-700 border-sky-100";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}
