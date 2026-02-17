import React from "react";
import type { Ticket } from "../../../../api/ticket.api";
import { fmtLocal } from "../../../../utils/date";

export default function TicketListView({
  tickets,
  onOpenTicket,
}: {
  tickets: Ticket[];
  onOpenTicket: (t: Ticket) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 p-4">
        <div className="font-semibold text-slate-900">All tickets</div>
        <div className="text-sm text-slate-600">Click a row to open details.</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">ID</th>
              <th className="text-left px-4 py-3 font-semibold">Company</th>
              <th className="text-left px-4 py-3 font-semibold">Type</th>
              <th className="text-left px-4 py-3 font-semibold">Stage</th>
              <th className="text-left px-4 py-3 font-semibold">Assignee</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr
                key={t.ticketId}
                className="border-t border-slate-100 hover:bg-sky-50 cursor-pointer"
                onClick={() => onOpenTicket(t)}
              >
                <td className="px-4 py-3 font-bold text-sky-800">#{t.ticketId}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{t.companyName}</div>
                  <div className="text-xs text-slate-500">{t.branchName}</div>
                </td>
                <td className="px-4 py-3">{t.ticketTypeName}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{t.currentStageName}</td>
                <td className="px-4 py-3">{t.assignedAdminUsername ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-800">
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{fmtLocal(t.updatedAtUtc)}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
