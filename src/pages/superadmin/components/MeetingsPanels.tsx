import React from "react";
import type { CalendarMeeting } from "../../../api/calendar.api";

function formatLocal(isoUtc: string) {
  return new Intl.DateTimeFormat("en-LK", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoUtc));
}

function getParticipantsText(m: CalendarMeeting) {
  const names = (m.participants ?? [])
    .map((p) => {
      if (p.participantType === "ADMIN") {
        // backend provides username for admins (name can be null)
        return p.adminUsername ?? null;
      }

      if (p.participantType === "COMPANY_CONTACT") {
        return p.companyContactPersonName ?? null;
      }

      if (p.participantType === "EXTERNAL") {
        return p.name ?? p.email ?? null;
      }

      // fallback if any new participant types come
      return p.name ?? p.email ?? p.adminUsername ?? p.companyContactPersonName ?? null;
    })
    .filter((x): x is string => Boolean(x));

  // remove duplicates
  const unique = Array.from(new Set(names));
  return unique.length ? unique.join(", ") : "—";
}

export default function MeetingsPanels({
  upcomingMeetings,
  selectedDayKey,
  dayMeetings,
}: {
  upcomingMeetings: CalendarMeeting[];
  selectedDayKey: string | null;
  dayMeetings: CalendarMeeting[];
}) {
  return (
    <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Upcoming */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Upcoming Meetings</h2>
        <p className="mt-1 text-sm text-slate-500">Next 5 future meetings</p>

        <div className="mt-4 space-y-3">
          {upcomingMeetings.length === 0 ? (
            <div className="text-sm text-slate-500">No upcoming meetings</div>
          ) : (
            upcomingMeetings.map((m) => (
              <div key={m.meetingId} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {m.companyName ?? "Company"} • {m.branchName ?? "Branch"}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      {m.stageName} • {formatLocal(m.meetingAtUtc)} • {m.status}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Participants:{" "}
                      <span className="font-medium text-slate-700">
                        {getParticipantsText(m)}
                      </span>
                    </div>

                    {m.agenda && (
                      <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {m.agenda}
                      </div>
                    )}
                  </div>

                  {m.meetingLink && (
                    <a
                      className="shrink-0 text-xs font-semibold text-sky-700 hover:underline"
                      href={m.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Day */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">
          Meetings on {selectedDayKey ?? "—"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Click a highlighted date on the calendar
        </p>

        <div className="mt-4 space-y-3">
          {dayMeetings.length === 0 ? (
            <div className="text-sm text-slate-500">No meetings on this day</div>
          ) : (
            dayMeetings.map((m) => (
              <div key={m.meetingId} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      Ticket #{m.ticketId} • {m.stageName}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      {formatLocal(m.meetingAtUtc)} • {m.status}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {m.companyName ?? "Company"} • {m.branchName ?? "Branch"}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Participants:{" "}
                      <span className="font-medium text-slate-700">
                        {getParticipantsText(m)}
                      </span>
                    </div>
                  </div>

                  {m.meetingLink && (
                    <a
                      className="shrink-0 text-xs font-semibold text-sky-700 hover:underline"
                      href={m.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join
                    </a>
                  )}
                </div>

                {m.location && (
                  <div className="mt-2 text-xs text-slate-500">
                    Location: {m.location}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
