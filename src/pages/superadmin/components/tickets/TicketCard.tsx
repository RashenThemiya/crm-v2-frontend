import React from "react";
import type { Ticket } from "../../../../api/ticket.api";
import { fmtLocal } from "../../../../utils/date";

export default function TicketCard({
  t,
  onOpen,
}: {
  t: Ticket;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-2xl border border-slate-100 bg-white p-4 hover:shadow-sm hover:border-sky-200 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-800">
              #{t.ticketId}
            </span>
            <span className="text-sm font-semibold text-slate-900 truncate">
              {t.companyName} • {t.branchName}
            </span>
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {t.ticketTypeName} • Stage: <span className="font-semibold">{t.currentStageName}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill tone={t.status}>{t.status}</Pill>
            <span className="text-xs text-slate-500">
              Assignee: <span className="font-semibold">{t.assignedAdminUsername ?? "—"}</span>
            </span>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-500">
          <div>Updated</div>
          <div className="font-semibold text-slate-700">{fmtLocal(t.updatedAtUtc)}</div>
        </div>
      </div>
    </button>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: string }) {
  const cls =
    tone === "OPEN"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "PROCESSING"
      ? "bg-sky-50 text-sky-700"
      : tone === "ON_HOLD"
      ? "bg-amber-50 text-amber-800"
      : tone === "CLOSED"
      ? "bg-slate-100 text-slate-700"
      : "bg-red-50 text-red-700";

  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>{children}</span>;
}
