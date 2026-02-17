import React, { useMemo, useState } from "react";
import type { Ticket } from "../../../../api/ticket.api";
import type { TicketStage } from "../../../../api/ticketStage.api";
import type { TicketType } from "../../../../api/ticketType.api";
import TicketBoardView from "./TicketBoardView";

export default function TicketBoardByTypeView({
  tickets,
  ticketTypes,
  stagesMap,
  loadingStages, // ✅ include it here
  onOpenTicket,
}: {
  tickets: Ticket[];
  ticketTypes: TicketType[];
  stagesMap: Record<number, TicketStage[]>;
  loadingStages: boolean; // ✅ prop declared here
  onOpenTicket: (t: Ticket) => void;
}) {
  const availableTypeIds = useMemo(() => {
    return Array.from(
      new Set((tickets ?? []).map((t: any) => Number(t.ticketTypeId)).filter(Boolean))
    );
  }, [tickets]);

  const typesToShow = useMemo(() => {
    return (ticketTypes ?? []).filter((tt) =>
      availableTypeIds.includes(Number(tt.ticketTypeId))
    );
  }, [ticketTypes, availableTypeIds]);

  const [activeTypeId, setActiveTypeId] = useState<number | null>(
    typesToShow?.[0]?.ticketTypeId ?? null
  );

  // keep active valid when tickets / filters change
  React.useEffect(() => {
    if (!activeTypeId && typesToShow.length > 0) {
      setActiveTypeId(typesToShow[0].ticketTypeId);
      return;
    }
    if (activeTypeId && !typesToShow.some((t) => t.ticketTypeId === activeTypeId)) {
      setActiveTypeId(typesToShow[0]?.ticketTypeId ?? null);
    }
  }, [activeTypeId, typesToShow]);

  const ticketsOfType = useMemo(() => {
    if (!activeTypeId) return [];
    return (tickets ?? []).filter((t: any) => Number(t.ticketTypeId) === Number(activeTypeId));
  }, [tickets, activeTypeId]);

  const stagesOfType = useMemo(() => {
    if (!activeTypeId) return [];
    return stagesMap[activeTypeId] ?? [];
  }, [activeTypeId, stagesMap]);

  if (typesToShow.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600">
        No tickets to show.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {typesToShow.map((tt) => {
          const count = tickets.filter((t: any) => Number(t.ticketTypeId) === tt.ticketTypeId).length;

          return (
            <button
              key={tt.ticketTypeId}
              type="button"
              onClick={() => setActiveTypeId(tt.ticketTypeId)}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold border",
                activeTypeId === tt.ticketTypeId
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              {tt.name}
              <span className="ml-2 text-xs opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Loading hint (optional but recommended) */}
      {loadingStages && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          Loading stages…
        </div>
      )}

      {/* Board for that type */}
      <TicketBoardView tickets={ticketsOfType} stages={stagesOfType} onOpenTicket={onOpenTicket} />
    </div>
  );
}
