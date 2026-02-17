import React, { useEffect, useMemo, useState } from "react";
import type { Ticket } from "../../../../api/ticket.api";
import type { TicketStage } from "../../../../api/ticketStage.api";
import TicketCard from "./TicketCard";

type SortMode = "UPDATED_DESC" | "UPDATED_ASC" | "CREATED_DESC" | "CREATED_ASC";

function safeSortStages(stages: TicketStage[]) {
  return (stages ?? []).slice().sort((a, b) => Number((a as any).stageOrder ?? 0) - Number((b as any).stageOrder ?? 0));
}

function ts(v?: string | null) {
  const t = v ? new Date(v).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}

// normalize any id (string/number/undefined) -> number | null
function idNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ✅ accept stage id from multiple DTO styles
function stageIdOf(s: any): number | null {
  return idNum(s?.stageId ?? s?.id ?? s?.ticketStageId ?? s?.stage_id);
}

export default function TicketBoardView({
  tickets,
  stages,
  onOpenTicket,
}: {
  tickets: Ticket[];
  stages: TicketStage[];
  onOpenTicket: (t: Ticket) => void;
}) {
  const sortedStages = useMemo(() => safeSortStages(stages), [stages]);

  // ✅ DEBUG: log when API data arrives/changes
  useEffect(() => {
    console.log("==== TicketBoardView DEBUG (props) ====");
    console.log("tickets count:", tickets?.length ?? 0);
    console.log("stages count:", stages?.length ?? 0);

    if ((stages?.length ?? 0) > 0) {
      console.log("first stage:", stages[0]);
      console.log("stage keys:", Object.keys(stages[0] as any));
      console.log("first stageIdOf:", stageIdOf(stages[0]));
    }

    if ((tickets?.length ?? 0) > 0) {
      console.log("first ticket:", tickets[0]);
      console.log("ticket keys:", Object.keys(tickets[0] as any));
      console.log("first ticket currentStageId:", (tickets[0] as any).currentStageId);
      console.log("first ticket currentStageName:", (tickets[0] as any).currentStageName);
    }

    console.log("=======================================");
  }, [tickets, stages]);

  // ✅ group tickets by stageId (robust)
  const grouped = useMemo(() => {
    const map = new Map<number, Ticket[]>();

    // create buckets for each stage
    for (const s of sortedStages) {
      const sid = stageIdOf(s);
      if (sid != null) map.set(sid, []);
    }

    const other: Ticket[] = [];

    (tickets ?? []).forEach((t: any) => {
      const tidStage = idNum(t.currentStageId);
      if (tidStage == null) {
        other.push(t);
        return;
      }

      const bucket = map.get(tidStage);
      if (bucket) bucket.push(t);
      else other.push(t);
    });

    // ✅ DEBUG: grouping stats
    console.log("==== TicketBoardView DEBUG (grouping) ====");
    console.log("stage buckets:", Array.from(map.keys()));
    console.log("other tickets:", other.length);
    console.log("=========================================");

    return { map, other };
  }, [tickets, sortedStages]);

  // ✅ pick default active stage (first stage that has tickets, else first stage)
  const firstStageId = useMemo(() => {
    const s0 = sortedStages[0];
    return s0 ? stageIdOf(s0) : null;
  }, [sortedStages]);

  const firstNonEmptyStageId = useMemo(() => {
    for (const s of sortedStages) {
      const sid = stageIdOf(s);
      if (sid == null) continue;
      const list = grouped.map.get(sid) ?? [];
      if (list.length > 0) return sid;
    }
    return firstStageId;
  }, [sortedStages, grouped.map, firstStageId]);

  const [activeStageId, setActiveStageId] = useState<number | "OTHER" | null>(null);

  // ✅ set default active stage when data arrives
  useEffect(() => {
    if (activeStageId == null && firstNonEmptyStageId != null) {
      setActiveStageId(firstNonEmptyStageId);
    }
  }, [activeStageId, firstNonEmptyStageId]);

  // ✅ keep active stage valid when stages change
  useEffect(() => {
    if (activeStageId == null) return;
    if (activeStageId === "OTHER") return;

    const exists = sortedStages.some((s: any) => stageIdOf(s) === activeStageId);
    if (!exists) setActiveStageId(firstNonEmptyStageId ?? null);
  }, [sortedStages, activeStageId, firstNonEmptyStageId]);

  // toolbar
  const [q, setQ] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("UPDATED_DESC");
  const [compact, setCompact] = useState(false);

  const activeStage = useMemo(() => {
    if (activeStageId === "OTHER" || activeStageId == null) return null;
    return sortedStages.find((s: any) => stageIdOf(s) === activeStageId) ?? null;
  }, [activeStageId, sortedStages]);

  const activeList = useMemo(() => {
    let list: Ticket[] = [];

    if (activeStageId === "OTHER") list = grouped.other;
    else if (typeof activeStageId === "number") list = grouped.map.get(activeStageId) ?? [];

    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter((t: any) => {
        const id = String(t.ticketId ?? "");
        const company = String(t.companyName ?? "").toLowerCase();
        const branch = String(t.branchName ?? "").toLowerCase();
        const type = String(t.ticketTypeName ?? "").toLowerCase();
        const subject = String(t.subject ?? t.title ?? "").toLowerCase();
        return id.includes(qq) || company.includes(qq) || branch.includes(qq) || type.includes(qq) || subject.includes(qq);
      });
    }

    return list.slice().sort((a: any, b: any) => {
      if (sortMode === "UPDATED_DESC") return ts(b.updatedAtUtc) - ts(a.updatedAtUtc);
      if (sortMode === "UPDATED_ASC") return ts(a.updatedAtUtc) - ts(b.updatedAtUtc);
      if (sortMode === "CREATED_DESC") return ts(b.createdAtUtc) - ts(a.createdAtUtc);
      return ts(a.createdAtUtc) - ts(b.createdAtUtc);
    });
  }, [activeStageId, grouped.map, grouped.other, q, sortMode]);

  const totalCount = tickets?.length ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT */}
      <div className="lg:col-span-3">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <div className="text-sm font-semibold text-slate-900">Stages</div>
            <div className="mt-1 text-xs text-slate-500">
              Total tickets: <span className="font-semibold text-slate-700">{totalCount}</span>
            </div>
          </div>

          {sortedStages.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No stages found for this view.</div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto p-2 space-y-2">
              {sortedStages.map((s: any) => {
                const sid = stageIdOf(s);
                if (sid == null) return null;

                const count = (grouped.map.get(sid) ?? []).length;
                const active = activeStageId === sid;

                return (
                  <button
                    key={sid}
                    type="button"
                    onClick={() => setActiveStageId(sid)}
                    className={[
                      "w-full text-left rounded-2xl border px-3 py-2 flex items-center justify-between gap-3",
                      active ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {Number((s as any).stageOrder ?? 0)}. {(s as any).stageName}
                      </div>
                      <div className="text-xs text-slate-500">{(s as any).isFinal ? "Final stage" : "In progress"}</div>
                    </div>

                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                      {count}
                    </span>
                  </button>
                );
              })}

              {grouped.other.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveStageId("OTHER")}
                  className={[
                    "w-full text-left rounded-2xl border px-3 py-2 flex items-center justify-between gap-3",
                    activeStageId === "OTHER" ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">Other</div>
                    <div className="text-xs text-slate-500">Unknown stage</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                    {grouped.other.length}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="lg:col-span-9 space-y-3">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-sky-700">Board view</div>
                <div className="mt-1 text-lg font-bold text-slate-900 truncate">
                  {activeStageId === "OTHER"
                    ? "Other (Unknown stage)"
                    : activeStage
                    ? `${(activeStage as any).stageOrder}. ${(activeStage as any).stageName}`
                    : "Select a stage"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{activeList.length}</span> tickets
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search (id, company, subject...)"
                    className="w-64 max-w-[70vw] bg-transparent text-sm outline-none"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
                  >
                    <option value="UPDATED_DESC">Updated ↓</option>
                    <option value="UPDATED_ASC">Updated ↑</option>
                    <option value="CREATED_DESC">Created ↓</option>
                    <option value="CREATED_ASC">Created ↑</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setCompact((v) => !v)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {compact ? "Normal" : "Compact"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50">
            {activeStageId == null ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600">
                Select a stage to view tickets
              </div>
            ) : activeList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600">
                No tickets here
              </div>
            ) : (
              <div className={compact ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-3"}>
                {activeList.map((t: any) => (
                  <div
                    key={t.ticketId}
                    className={compact ? "rounded-2xl border border-slate-100 bg-white p-2" : ""}
                  >
                    <TicketCard t={t} onOpen={() => onOpenTicket(t)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-500">Tip: Use the left stage list to switch quickly.</div>
      </div>
    </div>
  );
}
