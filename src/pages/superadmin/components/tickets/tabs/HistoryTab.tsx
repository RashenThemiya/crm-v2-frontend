import React, { useMemo } from "react";
import type { TicketStageHistory } from "../../../../../api/ticketStageHistory.api";
import { fmtLocal } from "../../../../../utils/date";

export default function HistoryTab({ history }: { history: TicketStageHistory[] }) {
  const sortedHistory = useMemo(() => {
    return (history ?? []).slice().sort((a, b) => new Date(b.changedAtUtc).getTime() - new Date(a.changedAtUtc).getTime());
  }, [history]);

  return (
    <div className="space-y-3">
      {sortedHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          No stage history yet.
        </div>
      ) : (
        sortedHistory.map((h) => (
          <div key={h.historyId} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="font-semibold text-slate-900">
              {h.fromStage ?? "—"} → {h.toStage ?? "—"}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {h.changedBy} • {fmtLocal(h.changedAtUtc)}
            </div>
            {h.note && <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{h.note}</div>}
          </div>
        ))
      )}
    </div>
  );
}
