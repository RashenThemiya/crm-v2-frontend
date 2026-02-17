import React, { useState } from "react";
import type { Ticket } from "../../../../../api/ticket.api";
import type { TicketStage } from "../../../../../api/ticketStage.api";
import type { TicketNote } from "../../../../../api/ticketNote.api";
import { fmtLocal } from "../../../../../utils/date";
import { Section, Select } from "../ui";

export default function NotesTab({
  ticket,
  stages,
  notes,
  onAddNote,
}: {
  ticket: Ticket;
  stages: TicketStage[];
  notes: TicketNote[];
  onAddNote: (payload: { noteTopic: string; note: string; stageId?: number | null }) => Promise<void>;
}) {
  const [newTopic, setNewTopic] = useState("");
  const [newNote, setNewNote] = useState("");
  const [noteStageId, setNoteStageId] = useState<number | "NONE">("NONE");
  const [savingNote, setSavingNote] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-5 space-y-4">
        <Section title="Add note">
          <div className="grid grid-cols-1 gap-3">
            <input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Topic (e.g., Shortlist, Client update)"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            />

            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write note..."
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            />

            <Select
              label="Attach to stage (optional)"
              value={noteStageId}
              options={[{ value: "NONE", label: "No stage" }, ...stages.map((s) => ({ value: s.stageId, label: s.stageName }))]}
              onChange={(v) => setNoteStageId(v === "NONE" ? "NONE" : Number(v))}
            />

            <div className="flex justify-end">
              <button
                type="button"
                disabled={savingNote || !newTopic.trim() || !newNote.trim()}
                onClick={async () => {
                  setSavingNote(true);
                  try {
                    await onAddNote({
                      noteTopic: newTopic.trim(),
                      note: newNote.trim(),
                      stageId: noteStageId === "NONE" ? null : (noteStageId as number),
                    });
                    setNewTopic("");
                    setNewNote("");
                    setNoteStageId("NONE");
                  } finally {
                    setSavingNote(false);
                  }
                }}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
              >
                {savingNote ? "Saving..." : "Add Note"}
              </button>
            </div>
          </div>
        </Section>

        <Section title="Tip">
          <div className="text-sm text-slate-600 leading-relaxed">
            Notes without stage will still appear here. If you want them visible in Overview stage flow, attach a stage.
          </div>
        </Section>
      </div>

      <div className="lg:col-span-7 space-y-4">
        <Section title={`All Notes (${notes.length})`}>
          <div className="space-y-3">
            {notes.map((n: any) => (
              <div key={n.ticketNoteId} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">{n.noteTopic}</div>
                    <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{n.note}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {n.stageName ?? "No stage"}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {n.createdBy} • {fmtLocal(n.createdAtUtc)}
                </div>
              </div>
            ))}
            {notes.length === 0 && <div className="text-sm text-slate-500">No notes yet.</div>}
          </div>
        </Section>
      </div>
    </div>
  );
}
