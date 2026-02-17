import React, { useEffect, useMemo, useState } from "react";
import type { Ticket } from "../../../../../api/ticket.api";
import type { TicketStage } from "../../../../../api/ticketStage.api";
import type { TicketMeeting, MeetingStatus } from "../../../../../api/ticketMeeting.api";
import type { ContactPerson } from "../../../../../api/contactPerson.api";
import { addParticipant, createMeeting, deleteParticipant, updateMeeting } from "../../../../../api/ticketMeeting.api";
import { fmtLocal } from "../../../../../utils/date";
import { Section, toDatetimeLocalValueFromUtc, datetimeLocalToUtcIso, participantLabel } from "../ui";

const meetingStatuses: MeetingStatus[] = ["SCHEDULED", "DONE", "CANCELED"];

function contactId(c: any): number | null {
  const v = c?.contactPersonId ?? c?.id ?? c?.personId ?? c?.companyContactPersonId;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

type ParticipantDraft = {
  pType: "ADMIN" | "COMPANY_CONTACT" | "EXTERNAL";
  pAdminId: string;   // "NONE" or adminId
  pContactId: string; // "NONE" or contactId
  pName: string;
  pEmail: string;
  pPhone: string;
  adding: boolean;
};

function makeDefaultDraft(): ParticipantDraft {
  return {
    pType: "ADMIN",
    pAdminId: "NONE",
    pContactId: "NONE",
    pName: "",
    pEmail: "",
    pPhone: "",
    adding: false,
  };
}

export default function MeetingsTab({
  ticket,
  stages,
  meetings,
  admins,
  contactPersons,
  onRefresh,
}: {
  ticket: Ticket;
  stages: TicketStage[];
  meetings: TicketMeeting[];
  admins: Array<{ adminId: number; username: string }>;
  contactPersons: ContactPerson[];
  onRefresh: () => Promise<void> | void;
}) {
  // create
  const [mStageId, setMStageId] = useState<number | "NONE">("NONE");
  const [mAtLocal, setMAtLocal] = useState("");
  const [mLink, setMLink] = useState("");
  const [mLocation, setMLocation] = useState("");
  const [mAgenda, setMAgenda] = useState("");
  const [creatingMeeting, setCreatingMeeting] = useState(false);

  // edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAtLocal, setEditAtLocal] = useState("");
  const [editStatus, setEditStatus] = useState<MeetingStatus>("SCHEDULED");
  const [editAgenda, setEditAgenda] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // ✅ DEBUG: confirm admin gets contacts
  useEffect(() => {
    console.log("=== MeetingsTab DEBUG ===");
    console.log("ticketId:", (ticket as any)?.ticketId);
    console.log("ticket.companyId:", (ticket as any)?.companyId);
    console.log("admins length:", admins?.length ?? 0);
    console.log("contactPersons length:", contactPersons?.length ?? 0);
    console.log("contactPersons sample:", (contactPersons as any)?.[0]);
    console.log("=========================");
  }, [ticket, admins, contactPersons]);

  // ✅ normalize contacts so dropdown always uses a real numeric id
  const normalizedContacts = useMemo(() => {
    return (contactPersons ?? [])
      .map((c: any) => {
        const cid = contactId(c);
        if (cid == null) return null;
        return { ...c, __cid: cid };
      })
      .filter(Boolean) as Array<any & { __cid: number }>;
  }, [contactPersons]);

  // ✅ participant state PER meeting id
  const [drafts, setDrafts] = useState<Record<number, ParticipantDraft>>({});

  function getDraft(meetingId: number): ParticipantDraft {
    return drafts[meetingId] ?? makeDefaultDraft();
  }

  function patchDraft(meetingId: number, patch: Partial<ParticipantDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [meetingId]: { ...(prev[meetingId] ?? makeDefaultDraft()), ...patch },
    }));
  }

  function resetDraft(meetingId: number) {
    setDrafts((prev) => ({ ...prev, [meetingId]: makeDefaultDraft() }));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-5 space-y-4">
        <Section title="Schedule meeting">
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
                <div className="text-[11px] font-semibold text-slate-600">Stage (optional)</div>
                <select
                  value={String(mStageId)}
                  onChange={(e) => setMStageId(e.target.value === "NONE" ? "NONE" : Number(e.target.value))}
                  className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                >
                  <option value="NONE">No stage</option>
                  {stages.map((s: any) => (
                    <option key={s.stageId} value={s.stageId}>
                      {s.stageOrder}. {s.stageName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
                <div className="text-[11px] font-semibold text-slate-600">Meeting time (local)</div>
                <input
                  type="datetime-local"
                  value={mAtLocal}
                  onChange={(e) => setMAtLocal(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>

            <input
              value={mLocation}
              onChange={(e) => setMLocation(e.target.value)}
              placeholder="Location (e.g., Google Meet / Office)"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            />
            <input
              value={mLink}
              onChange={(e) => setMLink(e.target.value)}
              placeholder="Meeting link (optional)"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            />
            <textarea
              value={mAgenda}
              onChange={(e) => setMAgenda(e.target.value)}
              placeholder="Agenda (optional)"
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            />

            <div className="flex justify-end">
              <button
                type="button"
                disabled={creatingMeeting || !mAtLocal}
                onClick={async () => {
                  setCreatingMeeting(true);
                  try {
                    await createMeeting({
                      ticketId: (ticket as any).ticketId,
                      stageId: mStageId === "NONE" ? null : (mStageId as number),
                      meetingAtUtc: datetimeLocalToUtcIso(mAtLocal),
                      meetingLink: mLink.trim() ? mLink.trim() : null,
                      location: mLocation.trim() ? mLocation.trim() : null,
                      agenda: mAgenda.trim() ? mAgenda.trim() : null,
                      participants: [],
                    });

                    setMStageId("NONE");
                    setMAtLocal("");
                    setMLink("");
                    setMLocation("");
                    setMAgenda("");
                    await onRefresh();
                  } finally {
                    setCreatingMeeting(false);
                  }
                }}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
              >
                {creatingMeeting ? "Creating..." : "Create Meeting"}
              </button>
            </div>
          </div>
        </Section>

        <Section title="Tip">
          <div className="text-sm text-slate-600 leading-relaxed">
            If you attach a stage to meetings, they will also appear in Overview stage flow panel.
          </div>
        </Section>
      </div>

      <div className="lg:col-span-7 space-y-4">
        <Section title={`All Meetings (${meetings.length})`}>
          {meetings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
              No meetings yet.
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((m: any) => {
                const isEditing = editingId === m.ticketMeetingId;
                const d = getDraft(m.ticketMeetingId);

                return (
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
                        onClick={() => {
                          if (isEditing) {
                            setEditingId(null);
                            return;
                          }
                          setEditingId(m.ticketMeetingId);
                          setEditAtLocal(toDatetimeLocalValueFromUtc(m.meetingAtUtc));
                          setEditStatus(m.status);
                          setEditAgenda(m.agenda ?? "");
                          setEditLink(m.meetingLink ?? "");
                          setEditLocation(m.location ?? "");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {isEditing ? "Close" : "Edit"}
                      </button>
                    </div>

                    {/* Participants */}
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-slate-600">
                        Participants ({m.participants?.length ?? 0})
                      </div>

                      {!m.participants || m.participants.length === 0 ? (
                        <div className="mt-1 text-sm text-slate-500">No participants.</div>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {m.participants.map((p: any) => (
                            <div
                              key={p.participantId}
                              className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2"
                            >
                              <div className="text-sm font-semibold text-slate-800 truncate">
                                {participantLabel(p)}
                                <span className="ml-2 text-xs text-slate-500">({p.participantType})</span>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteParticipant(p.participantId);
                                  await onRefresh();
                                }}
                                className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ✅ Add participant (PER MEETING STATE) */}
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <div className="text-xs font-semibold text-slate-700">Add participant</div>

                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                          <div className="text-[11px] font-semibold text-slate-600">Type</div>
                          <select
                            value={d.pType}
                            onChange={(e) => patchDraft(m.ticketMeetingId, { pType: e.target.value as any })}
                            className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="COMPANY_CONTACT">COMPANY_CONTACT</option>
                            <option value="EXTERNAL">EXTERNAL</option>
                          </select>
                        </div>

                        {d.pType === "ADMIN" && (
                          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                            <div className="text-[11px] font-semibold text-slate-600">Admin</div>
                            <select
                              value={d.pAdminId}
                              onChange={(e) => patchDraft(m.ticketMeetingId, { pAdminId: e.target.value })}
                              className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                            >
                              <option value="NONE">Select admin</option>
                              {admins.map((a) => (
                                <option key={a.adminId} value={a.adminId}>
                                  {a.username}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {d.pType === "COMPANY_CONTACT" && (
                          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                            <div className="text-[11px] font-semibold text-slate-600">Company contact</div>
                            <select
                              value={d.pContactId}
                              onChange={(e) => patchDraft(m.ticketMeetingId, { pContactId: e.target.value })}
                              className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                            >
                              <option value="NONE">Select contact</option>
                              {normalizedContacts.length === 0 ? (
                                <option value="NONE" disabled>
                                  No contacts available
                                </option>
                              ) : (
                                normalizedContacts.map((c: any) => (
                                  <option key={c.__cid} value={c.__cid}>
                                    {c.name} {c.branch?.branchName ? `(${c.branch.branchName})` : ""}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                        )}

                        {d.pType === "EXTERNAL" && (
                          <div className="grid grid-cols-1 gap-2">
                            <input
                              value={d.pName}
                              onChange={(e) => patchDraft(m.ticketMeetingId, { pName: e.target.value })}
                              placeholder="Name"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                            />
                            <input
                              value={d.pEmail}
                              onChange={(e) => patchDraft(m.ticketMeetingId, { pEmail: e.target.value })}
                              placeholder="Email (optional)"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                            />
                            <input
                              value={d.pPhone}
                              onChange={(e) => patchDraft(m.ticketMeetingId, { pPhone: e.target.value })}
                              placeholder="Phone (optional)"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                            />
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => resetDraft(m.ticketMeetingId)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Reset
                          </button>

                          <button
                            type="button"
                            disabled={d.adding}
                            onClick={async () => {
                              if (d.pType === "ADMIN" && d.pAdminId === "NONE") return;
                              if (d.pType === "COMPANY_CONTACT" && d.pContactId === "NONE") return;
                              if (d.pType === "EXTERNAL" && !d.pName.trim()) return;

                              patchDraft(m.ticketMeetingId, { adding: true });

                              try {
                                if (d.pType === "ADMIN") {
                                  await addParticipant(m.ticketMeetingId, {
                                    participantType: "ADMIN",
                                    adminId: Number(d.pAdminId),
                                  });
                                } else if (d.pType === "COMPANY_CONTACT") {
                                  await addParticipant(m.ticketMeetingId, {
                                    participantType: "COMPANY_CONTACT",
                                    companyContactPersonId: Number(d.pContactId),
                                  });
                                } else {
                                  await addParticipant(m.ticketMeetingId, {
                                    participantType: "EXTERNAL",
                                    name: d.pName.trim(),
                                    email: d.pEmail.trim() ? d.pEmail.trim() : null,
                                    phoneNumber: d.pPhone.trim() ? d.pPhone.trim() : null,
                                  });
                                }

                                resetDraft(m.ticketMeetingId);
                                await onRefresh();
                              } finally {
                                patchDraft(m.ticketMeetingId, { adding: false });
                              }
                            }}
                            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                          >
                            {d.adding ? "Adding..." : "Add"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Edit */}
                    {isEditing && (
                      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div className="text-xs font-semibold text-slate-700">Update meeting</div>

                        <div className="mt-2 grid grid-cols-1 gap-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                              <div className="text-[11px] font-semibold text-slate-600">Time (local)</div>
                              <input
                                type="datetime-local"
                                value={editAtLocal}
                                onChange={(e) => setEditAtLocal(e.target.value)}
                                className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                              />
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                              <div className="text-[11px] font-semibold text-slate-600">Status</div>
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as MeetingStatus)}
                                className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                              >
                                {meetingStatuses.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <input
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            placeholder="Location"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                          <input
                            value={editLink}
                            onChange={(e) => setEditLink(e.target.value)}
                            placeholder="Meeting link"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                          <textarea
                            value={editAgenda}
                            onChange={(e) => setEditAgenda(e.target.value)}
                            placeholder="Agenda"
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />

                          <div className="flex justify-end">
                            <button
                              type="button"
                              disabled={savingEdit || !editAtLocal}
                              onClick={async () => {
                                setSavingEdit(true);
                                try {
                                  await updateMeeting(m.ticketMeetingId, {
                                    meetingAtUtc: datetimeLocalToUtcIso(editAtLocal),
                                    status: editStatus,
                                    agenda: editAgenda.trim() ? editAgenda.trim() : null,
                                    meetingLink: editLink.trim() ? editLink.trim() : null,
                                    location: editLocation.trim() ? editLocation.trim() : null,
                                  });
                                  setEditingId(null);
                                  await onRefresh();
                                } finally {
                                  setSavingEdit(false);
                                }
                              }}
                              className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
                            >
                              {savingEdit ? "Saving..." : "Save changes"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
