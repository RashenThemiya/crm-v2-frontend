import React from "react";
import type { TicketType } from "../../../../api/ticketType.api";
import type { TicketStage } from "../../../../api/ticketStage.api";

export default function TicketStagePanel({
  selectedType,
  stages,
  loading,
  err,
  onAdd,
  onEdit,
  onDelete,
}: {
  selectedType: TicketType | null;
  stages: TicketStage[];
  loading: boolean;
  err: string;
  onAdd: () => void;
  onEdit: (s: TicketStage) => void;
  onDelete: (s: TicketStage) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Ticket Stages</h2>
          <p className="mt-1 text-sm text-slate-600">
            {selectedType
              ? `Manage stages under: ${selectedType.name}`
              : "Select a ticket type to manage its stages"}
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={!selectedType}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
        >
          + Add Stage
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mt-4">
        {!selectedType ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
            Choose a ticket type on the left to see stages.
          </div>
        ) : loading ? (
          <div className="text-sm text-slate-500">Loading stages...</div>
        ) : stages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
            No stages yet. Click <b>Add Stage</b> to create one.
          </div>
        ) : (
          <div className="space-y-2">
            {stages
              .slice()
              .sort((a, b) => a.stageOrder - b.stageOrder)
              .map((s) => (
                <div
                  key={s.stageId}
                  className="rounded-2xl border border-slate-100 bg-white p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {s.stageOrder}. {s.stageName}
                        </div>

                        {s.isFinal && (
                          <span className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                            Final
                          </span>
                        )}

                        <span
                          className={[
                            "rounded-full px-2 py-1 text-[11px] font-semibold",
                            s.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700",
                          ].join(" ")}
                        >
                          {s.isActive ? "Active" : "Inactive"}
                        </span>

                        <span className="rounded-full border border-slate-100 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
                          ID #{s.stageId}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Type: {s.ticketTypeName}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(s)}
                        className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(s)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
