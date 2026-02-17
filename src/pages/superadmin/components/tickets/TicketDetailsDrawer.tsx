import React, { useMemo, useState } from "react";
import type { Ticket, TicketStatus } from "../../../../api/ticket.api";
import type { TicketStage } from "../../../../api/ticketStage.api";
import type { TicketNote } from "../../../../api/ticketNote.api";
import type { TicketMeeting } from "../../../../api/ticketMeeting.api";
import type { ContactPerson } from "../../../../api/contactPerson.api";
import type { TicketStageHistory } from "../../../../api/ticketStageHistory.api";

import OverviewTab from "./tabs/OverviewTab";
import NotesTab from "./tabs/NotesTab";
import MeetingsTab from "./tabs/MeetingsTab";
import HistoryTab from "./tabs/HistoryTab";

import { TabBtn, safeSortStages } from "./ui";

export type DrawerTab = "OVERVIEW" | "NOTES" | "MEETINGS" | "HISTORY";

export default function TicketDetailsDrawer({
  open,
  ticket,
  stages,
  notes,
  meetings,
  history,
  admins,
  contactPersons,
  loading,
  err,
  onClose,
  onRefresh,
  onUpdateTicket,
  onAddNote,
  onDeleteTicket,
}: {
  open: boolean;
  ticket: Ticket | null;
  stages: TicketStage[];
  notes: TicketNote[];
  meetings: TicketMeeting[];
  history: TicketStageHistory[];
  admins: Array<{ adminId: number; username: string }>;
  contactPersons: ContactPerson[];
  loading: boolean;
  err: string;

  onClose: () => void;
  onRefresh: () => Promise<void> | void;

  onUpdateTicket: (payload: {
    assignedAdminId?: number | null;
    status?: TicketStatus;
    newStageId?: number | null;
    stageChangeNote?: string | null;
  }) => Promise<void>;

  onAddNote: (payload: { noteTopic: string; note: string; stageId?: number | null }) => Promise<void>;
  onDeleteTicket: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("OVERVIEW");

  // overview stage selection
  const [selectedStageId, setSelectedStageId] = useState<number | "ALL">("ALL");

  const statsTitle = useMemo(() => {
    if (!ticket) return "Loading...";
    return `#${ticket.ticketId} • ${ticket.companyName}`;
  }, [ticket]);

  const sortedStages = useMemo(() => safeSortStages(stages), [stages]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/30">
      <div className="h-full w-full max-w-6xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-100 p-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-sky-700">Ticket details</div>
            <div className="mt-1 text-xl font-bold text-slate-900 truncate">{statsTitle}</div>
            {ticket && (
              <div className="mt-1 text-sm text-slate-600">
                {ticket.branchName} • {ticket.ticketTypeName}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 px-5 py-3 flex gap-2 flex-wrap">
          <TabBtn active={tab === "OVERVIEW"} onClick={() => setTab("OVERVIEW")}>
            Overview
          </TabBtn>
          <TabBtn active={tab === "NOTES"} onClick={() => setTab("NOTES")}>
            Notes
          </TabBtn>
          <TabBtn active={tab === "MEETINGS"} onClick={() => setTab("MEETINGS")}>
            Meetings
          </TabBtn>
          <TabBtn active={tab === "HISTORY"} onClick={() => setTab("HISTORY")}>
            History
          </TabBtn>

          <div className="flex-1" />
          <button
            type="button"
            onClick={onDeleteTicket}
            className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            Delete
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && <div className="text-slate-500">Loading details...</div>}
          {!!err && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {ticket && tab === "OVERVIEW" && (
            <OverviewTab
              ticket={ticket}
              stages={sortedStages}
              notes={notes}
              meetings={meetings}
              history={history}
              admins={admins}
              selectedStageId={selectedStageId}
              setSelectedStageId={setSelectedStageId}
              onRefresh={onRefresh}
              onUpdateTicket={onUpdateTicket}
              goMeetings={() => setTab("MEETINGS")}
            />
          )}

          {ticket && tab === "NOTES" && (
            <NotesTab ticket={ticket} stages={sortedStages} notes={notes} onAddNote={onAddNote} />
          )}

          {ticket && tab === "MEETINGS" && (
            <MeetingsTab
              ticket={ticket}
              stages={sortedStages}
              meetings={meetings}
              admins={admins}
              contactPersons={contactPersons}
              onRefresh={onRefresh}
            />
          )}

          {ticket && tab === "HISTORY" && <HistoryTab history={history} />}
        </div>
      </div>
    </div>
  );
}
