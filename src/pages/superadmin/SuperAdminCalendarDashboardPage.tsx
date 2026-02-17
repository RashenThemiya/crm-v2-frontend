import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../utils/toast";
import { dayKey, fmtLocal } from "../../utils/date";
import MiniCalendar from "./components/MiniCalendar";

import type { CalendarMeeting, CalendarRangeParams } from "../../api/calendar.api";
import { useCalendar } from "./hooks/useCalendar";

/** Get YYYY-MM for initial calendar in a given tz */
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

/** month start/end in UTC ISO (Z) */
function monthRangeUtc(year: number, monthIndex0: number): CalendarRangeParams {
  const startUtc = new Date(Date.UTC(year, monthIndex0, 1, 0, 0, 0)).toISOString();
  const endUtc = new Date(Date.UTC(year, monthIndex0 + 1, 1, 0, 0, 0)).toISOString();
  return { fromUtc: startUtc, toUtc: endUtc };
}

function minutesUntil(utcIso: string) {
  const t = new Date(utcIso).getTime();
  const now = Date.now();
  return Math.round((t - now) / 60000);
}

function statusPill(status: string) {
  switch (status) {
    case "DONE":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "CANCELED":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "SCHEDULED":
    default:
      return "bg-sky-50 text-sky-800 border-sky-200";
  }
}

function urgencyBadge(mins: number) {
  if (mins < -5) return { text: `${Math.abs(mins)}m overdue`, cls: "bg-rose-50 text-rose-800 border-rose-200" };
  if (mins >= 0 && mins <= 60) return { text: `In ${mins}m`, cls: "bg-amber-50 text-amber-900 border-amber-200" };
  if (mins > 60 && mins <= 240)
    return { text: `In ${Math.round(mins / 60)}h`, cls: "bg-indigo-50 text-indigo-900 border-indigo-200" };
  return null;
}

export default function SuperAdminCalendarDashboardPage() {
  // ✅ Laptop timezone (auto)
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);

  const initial = useMemo(() => ymFromToday(tz), [tz]);
  const [year, setYear] = useState(initial.year);
  const [monthIndex0, setMonthIndex0] = useState(initial.monthIndex0);

  // ✅ Today key in laptop tz
  const todayKey = useMemo(() => dayKey(new Date().toISOString(), tz), [tz]);

  // ✅ Default view = TODAY only
  const [selectedKey, setSelectedKey] = useState<string | null>(todayKey);

  // ✅ Optional range filter (current month)
  const range = useMemo(() => monthRangeUtc(year, monthIndex0), [year, monthIndex0]);

  // ✅ SINGLE HOOK (role-based backend)
  const { meetings, loading, err } = useCalendar(range);

  // ✅ Dots for MiniCalendar (all meeting days)
  const meetingDays = useMemo(() => {
    const s = new Set<string>();
    (meetings ?? []).forEach((m) => s.add(dayKey(m.meetingAtUtc, tz)));
    return s;
  }, [meetings, tz]);

  // ✅ Group by day
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarMeeting[]>();
    (meetings ?? []).forEach((m) => {
      const k = dayKey(m.meetingAtUtc, tz);
      const list = map.get(k) ?? [];
      list.push(m);
      map.set(k, list);
    });

    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [meetings, tz]);

  // ✅ Visible groups:
  // - selectedKey (default today) => only that day
  // - selectedKey null => ALL
  const visibleGroups = useMemo(() => {
    if (selectedKey == null) return grouped;
    return grouped.filter(([day]) => day === selectedKey);
  }, [grouped, selectedKey]);

  // ✅ Notify once per meeting
  const notifiedIdsRef = useRef<Set<number>>(new Set());

  // ✅ Notifications: today + within 60 minutes
  useEffect(() => {
    if (!meetings?.length) return;

    const tick = () => {
      const nowToday = todayKey;

      meetings.forEach((m) => {
        if (m.status !== "SCHEDULED") return;

        const mk = dayKey(m.meetingAtUtc, tz);
        if (mk !== nowToday) return;

        const mins = minutesUntil(m.meetingAtUtc);
        if (mins < 0 || mins > 60) return;

        if (notifiedIdsRef.current.has(m.meetingId)) return;
        notifiedIdsRef.current.add(m.meetingId);

        toast(`⏰ Meeting soon: Ticket #${m.ticketId} • ${fmtLocal(m.meetingAtUtc, tz)} • in ${mins} min`);

        // Optional browser notification
        if (typeof window !== "undefined" && "Notification" in window) {
          try {
            if (Notification.permission === "granted") {
              new Notification("Meeting in less than 1 hour", {
                body: `Ticket #${m.ticketId} • ${fmtLocal(m.meetingAtUtc, tz)} • ${m.companyName ?? ""}`,
              });
            }
          } catch {}
        }
      });
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [meetings, tz, todayKey]);

  function onPrevMonth() {
    setMonthIndex0((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function onNextMonth() {
    setMonthIndex0((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-lg font-semibold text-slate-900">Meeting Calendar</div>

          <div className="text-sm text-slate-600">
            Timezone: <span className="font-semibold">{tz}</span>

            {selectedKey ? (
              <>
                {" "}
                • Showing:{" "}
                <span className="font-semibold">{selectedKey === todayKey ? "TODAY" : selectedKey}</span>
                <button className="ml-2 text-sky-700 hover:underline" onClick={() => setSelectedKey(null)} type="button">
                  Show all
                </button>
              </>
            ) : (
              <>
                {" "}
                • Showing: <span className="font-semibold">ALL DAYS</span>
                <button
                  className="ml-2 text-sky-700 hover:underline"
                  onClick={() => setSelectedKey(todayKey)}
                  type="button"
                >
                  Show today
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {"Notification" in window && Notification.permission !== "granted" ? (
            <button
              type="button"
              onClick={async () => {
                try {
                  await Notification.requestPermission();
                  toast("Browser notifications updated ✅");
                } catch {
                  toast("Notification permission failed", true);
                }
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Enable Notifications
            </button>
          ) : null}
        </div>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-4">
          <MiniCalendar
            year={year}
            monthIndex0={monthIndex0}
            meetingDays={meetingDays}
            selectedKey={selectedKey}
            onSelectKey={(k) => setSelectedKey(k)}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
          />

          <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-600">Legend</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sky-800">SCHEDULED</span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-800">
                DONE
              </span>
              <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-rose-800">
                CANCELED
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-900">
                Within 1 hour
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Meetings</div>
                <div className="text-sm text-slate-600">
                  {selectedKey
                    ? `Showing ${selectedKey === todayKey ? "today" : selectedKey} only.`
                    : "Showing all days."}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                {loading ? "Loading..." : `${meetings?.length ?? 0} total`}
              </div>
            </div>

            <div className="p-4 space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                  Loading meetings...
                </div>
              ) : visibleGroups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                  {selectedKey ? "No meetings on selected day." : "No meetings yet."}
                </div>
              ) : (
                visibleGroups.map(([day, list]) => {
                  const isToday = day === todayKey;

                  return (
                    <div key={day} className="rounded-2xl border border-slate-100 overflow-hidden">
                      <div
                        className={`px-4 py-3 font-semibold flex items-center justify-between ${
                          isToday ? "bg-amber-50 text-amber-900" : "bg-sky-50 text-sky-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{day}</span>
                          {isToday ? (
                            <span className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px] font-bold text-amber-900">
                              TODAY
                            </span>
                          ) : null}
                        </div>

                        <span
                          className={`rounded-full bg-white px-2 py-1 text-[11px] font-bold border ${
                            isToday ? "text-amber-900 border-amber-200" : "text-sky-800 border-sky-100"
                          }`}
                        >
                          {list.length}
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {list
                          .slice()
                          .sort((a, b) => (a.meetingAtUtc < b.meetingAtUtc ? -1 : 1))
                          .map((m) => {
                            const mins = minutesUntil(m.meetingAtUtc);
                            const urg = m.status === "SCHEDULED" ? urgencyBadge(mins) : null;

                            return (
                              <div key={m.meetingId} className="p-4 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-sm font-semibold text-slate-900">
                                      {fmtLocal(m.meetingAtUtc, tz)}
                                    </div>

                                    <span
                                      className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${statusPill(
                                        m.status
                                      )}`}
                                    >
                                      {m.status}
                                    </span>

                                    {urg ? (
                                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${urg.cls}`}>
                                        {urg.text}
                                      </span>
                                    ) : null}
                                  </div>

                                  <div className="mt-1 text-sm text-slate-700">
                                    <span className="font-semibold">Ticket #{m.ticketId}</span>
                                    {m.stageName ? ` • ${m.stageName}` : ""}
                                    {m.companyName ? ` • ${m.companyName}` : ""}
                                    {m.branchName ? ` • ${m.branchName}` : ""}
                                  </div>

                                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                                    <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5">
                                      👥 {m.participants?.length ?? 0} participants
                                    </span>

                                    {m.location ? (
                                      <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5">
                                        📍 {m.location}
                                      </span>
                                    ) : null}

                                    {m.meetingLink ? (
                                      <a
                                        href={m.meetingLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-indigo-900 hover:underline"
                                      >
                                        🔗 Join link
                                      </a>
                                    ) : null}
                                  </div>

                                  {m.agenda ? <div className="mt-2 text-xs text-slate-500">{m.agenda}</div> : null}
                                </div>

                                <div className="flex flex-col gap-2 items-end">
                                  <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                                    ID: <span className="font-semibold text-slate-900">{m.meetingId}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
