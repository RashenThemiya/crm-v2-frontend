import React, { useMemo } from "react";
import type { Ticket, TicketStatus } from "../../../../../api/ticket.api";
import type { TicketStage } from "../../../../../api/ticketStage.api";
import type { TicketNote } from "../../../../../api/ticketNote.api";
import type { TicketMeeting } from "../../../../../api/ticketMeeting.api";
import type { TicketStageHistory } from "../../../../../api/ticketStageHistory.api";
import { fmtLocal } from "../../../../../utils/date";
import { Info, Section, Select, StagePill, noteStageIdOf, meetingStageIdOf } from "../ui";

const statuses: TicketStatus[] = ["OPEN", "ON_HOLD", "CLOSED", "CANCELED"];

export default function OverviewTab({
  ticket,
  stages,
  notes,
  meetings,
  history,
  admins,
  selectedStageId,
  setSelectedStageId,
  onRefresh,
  onUpdateTicket,
  goMeetings,
}: {
  ticket: Ticket;
  stages: TicketStage[];
  notes: TicketNote[];
  meetings: TicketMeeting[];
  history: TicketStageHistory[];
  admins: Array<{ adminId: number; username: string }>;
  selectedStageId: number | "ALL";
  setSelectedStageId: (v: number | "ALL") => void;

  onRefresh: () => Promise<void> | void;
  onUpdateTicket: (payload: {
    assignedAdminId?: number | null;
    status?: TicketStatus;
    newStageId?: number | null;
    stageChangeNote?: string | null;
  }) => Promise<void>;

  goMeetings: () => void;
}) {
  const sortedHistory = useMemo(() => {
    return (history ?? []).slice().sort((a, b) => new Date(b.changedAtUtc).getTime() - new Date(a.changedAtUtc).getTime());
  }, [history]);

  const notesForSelectedStage = useMemo(() => {
    if (selectedStageId === "ALL") return notes;
    return (notes ?? []).filter((n: any) => noteStageIdOf(n) === selectedStageId);
  }, [notes, selectedStageId]);

  const meetingsForSelectedStage = useMemo(() => {
    if (selectedStageId === "ALL") return meetings;
    return (meetings ?? []).filter((m: any) => meetingStageIdOf(m) === selectedStageId);
  }, [meetings, selectedStageId]);

  const selectedStageName = useMemo(() => {
    if (selectedStageId === "ALL") return "All stages";
    const s = stages.find((x) => x.stageId === selectedStageId);
    return s ? `${s.stageOrder}. ${s.stageName}` : "Selected stage";
  }, [selectedStageId, stages]);

  const stageMeta = useMemo(() => {
    const map = new Map<number, { notes: number; meetings: number }>();
    for (const s of stages) map.set(s.stageId, { notes: 0, meetings: 0 });

    (notes ?? []).forEach((n: any) => {
      const sid = noteStageIdOf(n);
      if (!sid) return;
      const v = map.get(sid);
      if (v) v.notes += 1;
    });

    (meetings ?? []).forEach((m: any) => {
      const sid = meetingStageIdOf(m);
      if (!sid) return;
      const v = map.get(sid);
      if (v) v.meetings += 1;
    });

    return map;
  }, [notes, meetings, stages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT */}
      <div className="lg:col-span-5 space-y-4">
        <Section
          title="Quick update"
          right={
            <button
              type="button"
              onClick={() => onRefresh()}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status"
              value={ticket.status}
              options={statuses.map((s) => ({ value: s, label: s }))}
              onChange={(v) => onUpdateTicket({ status: v as TicketStatus })}
            />

            <Select
              label="Assignee"
              value={ticket.assignedAdminId ?? "NONE"}
              options={[
                { value: "NONE", label: "Unassigned" },
                ...admins.map((a) => ({ value: a.adminId, label: a.username })),
              ]}
              onChange={(v) => onUpdateTicket({ assignedAdminId: v === "NONE" ? null : Number(v) })}
            />

            <Select
              label="Stage"
              value={ticket.currentStageId}
              options={stages.map((s) => ({ value: s.stageId, label: `${s.stageOrder}. ${s.stageName}` }))}
              onChange={(v) =>
                onUpdateTicket({
                  newStageId: Number(v),
                  stageChangeNote: "Stage updated from dashboard",
                })
              }
            />

            <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
              <div className="text-[11px] font-semibold text-slate-600">Selected stage</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 truncate">{selectedStageName}</div>
            </div>
          </div>
        </Section>

        <Section title="Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Info label="Company" value={ticket.companyName} />
            <Info label="Branch" value={ticket.branchName} />
            <Info label="Type" value={ticket.ticketTypeName} />
            <Info label="Stage" value={ticket.currentStageName} />
            <Info label="Created by" value={ticket.createdByUsername} />
            <Info label="Updated by" value={ticket.updatedByUsername ?? "—"} />
            <Info label="Created" value={fmtLocal(ticket.createdAtUtc)} />
            <Info label="Updated" value={fmtLocal(ticket.updatedAtUtc)} />
          </div>
        </Section>

        <Section title="Stage flow (click a stage)">
          <div className="flex flex-wrap gap-2">
            <StagePill
              active={selectedStageId === "ALL"}
              highlight={false}
              onClick={() => setSelectedStageId("ALL")}
              label="All"
              meta={`${notes.length} notes • ${meetings.length} meetings`}
            />

            {stages.map((s) => {
              const meta = stageMeta.get(s.stageId) ?? { notes: 0, meetings: 0 };
              const isCurrent = ticket.currentStageId === s.stageId;

              return (
                <StagePill
                  key={s.stageId}
                  active={selectedStageId === s.stageId}
                  highlight={isCurrent}
                  onClick={() => setSelectedStageId(s.stageId)}
                  label={`${s.stageOrder}. ${s.stageName}`}
                  meta={`${meta.notes} notes • ${meta.meetings} meetings`}
                />
              );
            })}
          </div>

          <div className="mt-4 space-y-2">
            {(sortedHistory ?? []).slice(0, 6).map((h) => (
              <div key={h.historyId} className="flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 text-slate-700 truncate">
                  <span className="font-semibold">{h.fromStage ?? "—"}</span> →{" "}
                  <span className="font-semibold">{h.toStage ?? "—"}</span>
                  {h.note ? <span className="ml-2 text-slate-500 truncate">• {h.note}</span> : null}
                </div>
                <div className="text-slate-400 whitespace-nowrap">{fmtLocal(h.changedAtUtc)}</div>
              </div>
            ))}
            {(sortedHistory ?? []).length === 0 && <div className="text-sm text-slate-500">No stage history yet.</div>}
          </div>
        </Section>
      </div>

      {/* RIGHT */}
      <div className="lg:col-span-7 space-y-4">
        <Section
          title={`Notes (${notesForSelectedStage.length}) • ${selectedStageName}`}
          right={
            <span className="text-xs text-slate-500">
              Notes without stage are visible only in <span className="font-semibold">Notes</span> tab.
            </span>
          }
        >
          {notesForSelectedStage.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
              No notes for this stage.
            </div>
          ) : (
            <div className="space-y-3">
              {notesForSelectedStage.map((n: any) => (
                <div key={n.ticketNoteId} className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900">{n.noteTopic}</div>
                      <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{n.note}</div>
                    </div>
                    {n.stageName ? (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {n.stageName}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {n.createdBy} • {fmtLocal(n.createdAtUtc)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          title={`Meetings (${meetingsForSelectedStage.length}) • ${selectedStageName}`}
          right={
            <span className="text-xs text-slate-500">
              Meetings without stage are visible only in <span className="font-semibold">Meetings</span> tab.
            </span>
          }
        >
          {meetingsForSelectedStage.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
              No meetings for this stage.
            </div>
          ) : (
            <div className="space-y-3">
              {meetingsForSelectedStage.map((m: any) => (
                <div key={m.ticketMeetingId} className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900">
                        {fmtLocal(m.meetingAtUtc)} • {m.status}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {m.stageName ? `Stage: ${m.stageName}` : "No stage"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={goMeetings}
                      className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Open meetings tab →
                    </button>
                  </div>

                  {(m.location || m.meetingLink) && (
                    <div className="mt-2 text-sm text-slate-700 space-y-1">
                      {m.location && (
                        <div>
                          <span className="text-slate-500">Location:</span> {m.location}
                        </div>
                      )}
                      {m.meetingLink && (
                        <div className="truncate">
                          <span className="text-slate-500">Link:</span>{" "}
                          <a className="text-sky-700 hover:underline" href={m.meetingLink} target="_blank" rel="noreferrer">
                            {m.meetingLink}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {m.agenda && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-800 whitespace-pre-wrap">
                      {m.agenda}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-slate-500">
                    Created by {m.createdBy} • {fmtLocal(m.createdAtUtc)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
