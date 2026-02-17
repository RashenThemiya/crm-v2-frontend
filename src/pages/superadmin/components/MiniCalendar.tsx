import React from "react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function MiniCalendar({
  year,
  monthIndex0,
  meetingDays,
  selectedKey,
  onSelectKey,
  onPrevMonth,
  onNextMonth,
}: {
  year: number;
  monthIndex0: number; // 0..11
  meetingDays: Set<string>; // yyyy-mm-dd
  selectedKey: string | null;
  onSelectKey: (k: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const monthName = new Intl.DateTimeFormat("en", { month: "long" }).format(
    new Date(Date.UTC(year, monthIndex0, 1))
  );

  // Calendar matrix (Mon..Sun)
  const firstDay = new Date(Date.UTC(year, monthIndex0, 1));
  const lastDay = new Date(Date.UTC(year, monthIndex0 + 1, 0));

  // Convert to weekday (Mon=0..Sun=6)
  const firstWeekday = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = lastDay.getUTCDate();

  const cells: Array<{ key: string; day: number; inMonth: boolean }> = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ key: `blank-${i}`, day: 0, inMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const k = `${year}-${pad2(monthIndex0 + 1)}-${pad2(d)}`;
    cells.push({ key: k, day: d, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `blank-tail-${cells.length}`, day: 0, inMonth: false });
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {monthName} {year}
          </div>
          <div className="text-xs text-slate-500">Meeting days highlighted</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPrevMonth}
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50"
          >
            ←
          </button>
          <button
            onClick={onNextMonth}
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 text-xs text-slate-500">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-2 text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) => {
          if (!c.inMonth) return <div key={c.key} className="h-9" />;

          const hasMeeting = meetingDays.has(c.key);
          const isSelected = selectedKey === c.key;

          return (
            <button
              key={c.key}
              onClick={() => onSelectKey(c.key)}
              className={[
                "h-9 rounded-lg text-sm flex items-center justify-center transition border",
                isSelected
                  ? "border-sky-400 bg-sky-50"
                  : "border-transparent hover:bg-slate-50",
              ].join(" ")}
              title={hasMeeting ? "Meeting day" : ""}
            >
              <span className="relative">
                {c.day}
                {hasMeeting && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-sky-500" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
