import React from "react";
import type { TicketType } from "../../../../api/ticketType.api";

export default function TicketTypeList({
  types,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: {
  types: TicketType[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onEdit: (t: TicketType) => void;
  onDelete: (t: TicketType) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Ticket Types</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create types (Recruitment, Support…) and manage stages under them.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          type="button"
        >
          + Add Type
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {types.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
            No ticket types yet. Click <b>Add Type</b> to create one.
          </div>
        ) : (
          types.map((t) => {
            const active = selectedId === t.ticketTypeId;
            return (
              <div
                key={t.ticketTypeId}
                className={[
                  "rounded-2xl border p-4 transition",
                  active ? "border-sky-200 bg-sky-50" : "border-slate-100 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelect(t.ticketTypeId)}
                    className="min-w-0 text-left flex-1"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {t.name}
                      </div>
                      <span
                        className={[
                          "rounded-full px-2 py-1 text-[11px] font-semibold",
                          t.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
                        ].join(" ")}
                      >
                        {t.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="rounded-full border border-slate-100 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
                        ID #{t.ticketTypeId}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Click to manage stages →
                    </div>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(t)}
                      className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(t)}
                      className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
