// ✅ FULL UPDATED DASHBOARD PAGE (single endpoint dashboard + calendar)
// File: src/pages/super/SuperAdminDashboardPage.tsx  (path may differ)

import React, { useEffect, useMemo, useState } from "react";
import { getDashboard, type DashboardResponse } from "../../api/dashboard.api";
import { getMeetings, type CalendarMeeting } from "../../api/calendar.api";

import StatCard from "./components/StatCard";
import MiniCalendar from "./components/MiniCalendar";
import StatusCharts, { type StatusCount } from "./components/StatusCharts";
import MeetingsPanels from "./components/MeetingsPanels";

/** =========================
 * Helpers
 * ========================= */
function toUtcRangeForMonth(year: number, monthIndex0: number) {
  const from = new Date(Date.UTC(year, monthIndex0, 1, 0, 0, 0));
  const to = new Date(Date.UTC(year, monthIndex0 + 1, 0, 23, 59, 59));
  return { fromUtc: from.toISOString(), toUtc: to.toISOString() };
}

function localDateKey(isoUtc: string) {
  const d = new Date(isoUtc);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";
  return `${y}-${m}-${day}`;
}

function isFuture(isoUtc: string) {
  return new Date(isoUtc).getTime() > Date.now();
}

/** Simple inline icons (no extra libs) */
function Icon({
  name,
  className,
}: {
  name: "admins" | "company" | "branch" | "ticket" | "meeting";
  className?: string;
}) {
  const cls = `w-5 h-5 ${className ?? ""}`;

  switch (name) {
    case "admins":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path
            d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M4 20c1.5-4 14.5-4 16 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "company":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 20V6a2 2 0 0 1 2-2h7v16"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M13 9h5a2 2 0 0 1 2 2v9"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M7 8h2M7 12h2M7 16h2M16 12h2M16 16h2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "branch":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3 3 7v2h18V7l-9-4Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M5 9v11M9 9v11M15 9v11M19 9v11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 20h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "ticket":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 1 0 0-4V8Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M9 10h6M9 14h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "meeting":
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path
            d="M7 3v3M17 3v3M4 9h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 13h4M8 17h7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

/** Wrapper card to apply fixed height + internal scroll */
function ScrollCard({
  title,
  right,
  heightClass,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  heightClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden",
        heightClass ?? "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {right}
      </div>
      <div className="px-5 py-4 h-full overflow-auto">{children}</div>
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  const [dash, setDash] = useState<DashboardResponse | null>(null);
  const [meetings, setMeetings] = useState<CalendarMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const now = new Date();
  const [monthIndex0, setMonthIndex0] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const range = useMemo(
    () => toUtcRangeForMonth(year, monthIndex0),
    [year, monthIndex0]
  );

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const [d, m] = await Promise.all([
          getDashboard(),
          getMeetings(range),
        ]);

        if (!alive) return;

        setDash(d);
        setMeetings(m);

        const todayKey = localDateKey(new Date().toISOString());
        setSelectedDayKey((prev) => prev ?? todayKey);
      } catch (e: any) {
        if (!alive) return;
        setErr(
          e?.response?.data?.message || e?.message || "Failed to load dashboard"
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [range.fromUtc, range.toUtc]);

  const meetingDays = useMemo(() => {
    const s = new Set<string>();
    for (const m of meetings) s.add(localDateKey(m.meetingAtUtc));
    return s;
  }, [meetings]);

  const meetingsByDay = useMemo(() => {
    const map = new Map<string, CalendarMeeting[]>();
    for (const m of meetings) {
      const k = localDateKey(m.meetingAtUtc);
      const arr = map.get(k) ?? [];
      arr.push(m);
      map.set(k, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort(
        (a, b) =>
          new Date(a.meetingAtUtc).getTime() -
          new Date(b.meetingAtUtc).getTime()
      );
      map.set(k, arr);
    }
    return map;
  }, [meetings]);

  const upcomingMeetings = useMemo(() => {
    return meetings
      .filter((m) => isFuture(m.meetingAtUtc))
      .sort(
        (a, b) =>
          new Date(a.meetingAtUtc).getTime() -
          new Date(b.meetingAtUtc).getTime()
      )
      .slice(0, 10);
  }, [meetings]);

  const dayMeetings = selectedDayKey
    ? meetingsByDay.get(selectedDayKey) ?? []
    : [];

  const prevMonth = () => {
    setSelectedDayKey(null);
    setMonthIndex0((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setSelectedDayKey(null);
    setMonthIndex0((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const ticketChartData: StatusCount[] = useMemo(
    () =>
      (dash?.ticketByStatus ?? []).map((x) => ({
        name: x.status,
        value: x.count,
      })),
    [dash]
  );

  if (loading)
    return <div className="p-6 text-slate-600">Loading dashboard...</div>;

  if (err) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {err}
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-600">
          Nexas CRM overview (Powered by VentureCorp)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Admins"
          value={dash?.totalAdmins ?? 0}
          tone="indigo"
          icon={<Icon name="admins" />}
        />
        <StatCard
          title="Companies"
          value={dash?.totalCompanies ?? 0}
          tone="sky"
          icon={<Icon name="company" />}
        />
        <StatCard
          title="Branches"
          value={dash?.totalBranches ?? 0}
          tone="sky"
          icon={<Icon name="branch" />}
        />
        <StatCard
          title="Tickets"
          value={dash?.totalTickets ?? 0}
          tone="amber"
          icon={<Icon name="ticket" />}
        />
        <StatCard
          title="Upcoming Meetings"
          value={dash?.totalUpcomingMeetings ?? 0}
          tone="emerald"
          icon={<Icon name="meeting" />}
        />
        <StatCard
          title="Ticket Status Types"
          value={dash?.ticketByStatus?.length ?? 0}
          tone="indigo"
          icon={<Icon name="ticket" />}
          sub="How many status categories"
        />
      </div>

      {/* Charts + Calendar */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ScrollCard title="Tickets by Status" heightClass="h-[420px]">
            <StatusCharts
              title=""
              barData={ticketChartData}
              pieData={ticketChartData}
              pieLabel="Pie"
            />
          </ScrollCard>
        </div>

        <ScrollCard title="Meeting Calendar" heightClass="h-[420px]">
          <MiniCalendar
            year={year}
            monthIndex0={monthIndex0}
            meetingDays={meetingDays}
            selectedKey={selectedDayKey}
            onSelectKey={setSelectedDayKey}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </ScrollCard>
      </div>

      {/* Meetings */}
      <div className="mt-4">
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Meetings</h2>
            <div className="text-xs text-slate-500">Scroll inside this box</div>
          </div>

          <div className="max-h-[520px] overflow-auto px-5 py-4">
            <MeetingsPanels
              upcomingMeetings={upcomingMeetings}
              selectedDayKey={selectedDayKey}
              dayMeetings={dayMeetings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
