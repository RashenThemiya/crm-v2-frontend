import React, { useMemo, useState } from "react";
import type { TicketMeeting } from "../../../../api/ticketMeeting.api";
import type { CalendarMeeting } from "../../../../api/calendar.api"; // ✅ add this
import { dayKey, fmtLocal } from "../../../../utils/date";
import MiniCalendar from "../MiniCalendar";

type AnyMeeting = TicketMeeting | CalendarMeeting;

function ymFromToday(tz: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = Number(parts.find((p) => p.type === "year")?.value ?? "1970");
  const m = Number(parts.find((p) => p.type === "month")?.value ?? "01");
  return { year: y, monthIndex0: m - 1 };
}

// ✅ helper: stable unique key for both payloads
function meetingKey(m: AnyMeeting) {
  // TicketMeeting
  if ((m as any).ticketMeetingId != null) return `TM-${(m as any).ticketMeetingId}`;
  // CalendarMeeting
  if ((m as any).meetingId != null) return `CM-${(m as any).meetingId}`;
  // fallback
  return `F-${(m as any).ticketId ?? "?"}-${(m as any).meetingAtUtc ?? ""}`;
}

export default function TicketCalendarView({
  allMeetings,
  onOpenTicketId,
  tz = "Asia/Colombo",
}: {
  // ✅ accepts both
  allMeetings: Array<AnyMeeting & { ticketTitle?: string; companyName?: string; branchName?: string }>;
  onOpenTicketId: (ticketId: number) => void;
  tz?: string;
}) {
  const initial = useMemo(() => ymFromToday(tz), [tz]);
  const [year, setYear] = useState(initial.year);
  const [monthIndex0, setMonthIndex0] = useState(initial.monthIndex0);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // ✅ meeting dots for MiniCalendar
  const meetingDays = useMemo(() => {
    const s = new Set<string>();
    (allMeetings ?? []).forEach((x: any) => {
      s.add(dayKey(x.meetingAtUtc, tz));
    });
    return s;
  }, [allMeetings, tz]);

  // ✅ group meetings by day
  const grouped = useMemo(() => {
    const m = new Map<string, typeof allMeetings>();
    (allMeetings ?? []).forEach((x: any) => {
      const k = dayKey(x.meetingAtUtc, tz);
      const list = m.get(k) ?? [];
      list.push(x);
      m.set(k, list);
    });

    return Array.from(m.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [allMeetings, tz]);

  const visibleGroups = useMemo(() => {
    if (!selectedKey) return grouped;
    return grouped.filter(([day]) => day === selectedKey);
  }, [grouped, selectedKey]);

  function onPrevMonth() {
    setSelectedKey(null);
    setMonthIndex0((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function onNextMonth() {
    setSelectedKey(null);
    setMonthIndex0((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT */}
      <div className="lg:col-span-4">
        <MiniCalendar
          year={year}
          monthIndex0={monthIndex0}
          meetingDays={meetingDays}
          selectedKey={selectedKey}
          onSelectKey={(k) => setSelectedKey((prev) => (prev === k ? null : k))}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
        />

        <div className="mt-2 text-xs text-slate-500">
          Timezone: <span className="font-semibold">{tz}</span>
          {selectedKey ? (
            <>
              {" "}
              • Selected: <span className="font-semibold">{selectedKey}</span>{" "}
              <button
                className="ml-2 text-sky-700 hover:underline"
                onClick={() => setSelectedKey(null)}
                type="button"
              >
                Clear
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* RIGHT */}
      <div className="lg:col-span-8">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <div className="font-semibold text-slate-900">Meetings</div>
            <div className="text-sm text-slate-600">
              Grouped by day (timezone: {tz}).{selectedKey ? " Showing selected day only." : ""}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {visibleGroups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                {selectedKey ? "No meetings on selected day." : "No meetings yet."}
              </div>
            ) : (
              visibleGroups.map(([day, list]) => (
                <div key={day} className="rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="bg-sky-50 px-4 py-3 font-semibold text-sky-900">
                    {day}
                    <span className="ml-2 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-sky-800 border border-sky-100">
                      {list.length}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {list
                      .slice()
                      .sort((a: any, b: any) => (a.meetingAtUtc < b.meetingAtUtc ? -1 : 1))
                      .map((m: any) => (
                        <div key={meetingKey(m)} className="p-4 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900">
                              {fmtLocal(m.meetingAtUtc, tz)} • {m.status}
                            </div>

                            <div className="mt-1 text-sm text-slate-700">
                              Ticket #{m.ticketId}
                              {m.stageName ? ` • ${m.stageName}` : ""}
                              {m.companyName ? ` • ${m.companyName}` : ""}
                              {m.branchName ? ` • ${m.branchName}` : ""}
                            </div>

                            {m.agenda && <div className="mt-1 text-xs text-slate-500">{m.agenda}</div>}
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenTicketId(m.ticketId)}
                            className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                          >
                            Open ticket
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
