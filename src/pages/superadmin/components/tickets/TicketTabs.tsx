import React from "react";

export type TicketViewMode = "BOARD" | "LIST" | "CALENDAR";

export default function TicketTabs({
  mode,
  onChange,
}: {
  mode: TicketViewMode;
  onChange: (m: TicketViewMode) => void;
}) {
  const items: Array<{ key: TicketViewMode; label: string }> = [
    { key: "BOARD", label: "Board" },
    { key: "LIST", label: "List" },
  ];

  return (
    <div className="inline-flex rounded-2xl border border-slate-100 bg-white p-1 shadow-sm">
      {items.map((it) => {
        const active = mode === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              active ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
