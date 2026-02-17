import React, { useEffect, useMemo, useState } from "react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { toast } from "../../utils/toast";

import TicketTabs, { type TicketViewMode } from "./components/tickets/TicketTabs";
import TicketToolbar from "./components/tickets/TicketToolbar";
import TicketBoardByTypeView from "./components/tickets/TicketBoardByTypeView";
import TicketListView from "./components/tickets/TicketListView";

import TicketDetailsDrawer from "./components/tickets/TicketDetailsDrawer";
import TicketCreateModal from "./components/tickets/TicketCreateModal";

import { useTickets } from "./hooks/useTickets";
import { useTicketStagesByType } from "./hooks/useTicketStagesByType";
import { useTicketDetails } from "./hooks/useTicketDetails";

import { deleteTicket, updateTicket, type Ticket } from "../../api/ticket.api";
import { createTicketNote } from "../../api/ticketNote.api";

import { listTicketTypes, type TicketType } from "../../api/ticketType.api";
import { listCompanies } from "../../api/company.api";
import { listBranches } from "../../api/branch.api";
import { getAdmins } from "../../api/admins.api";
import { listContactPersons } from "../../api/contactPerson.api";

import { listTicketStages, type TicketStage } from "../../api/ticketStage.api";

/**
 * ✅ Hook: load stages for all ticket types (cache by typeId)
 */
function useTicketStagesMapByTypes(typeIds: number[]) {
  const [stagesMap, setStagesMap] = useState<Record<number, TicketStage[]>>({});
  const [loadingStages, setLoadingStages] = useState(false);
  const [stagesErr, setStagesErr] = useState("");

  useEffect(() => {
    const ids = Array.from(new Set((typeIds ?? []).map(Number).filter(Boolean)));
    if (ids.length === 0) return;

    const missing = ids.filter((id) => !stagesMap[id]);
    if (missing.length === 0) return;

    let cancelled = false;

    (async () => {
      setLoadingStages(true);
      setStagesErr("");
      try {
        const res = await Promise.all(
          missing.map(async (id) => {
            const stages = await listTicketStages(id);
            return [id, stages ?? []] as const;
          })
        );

        if (cancelled) return;

        setStagesMap((prev) => {
          const next = { ...prev };
          res.forEach(([id, stages]) => (next[id] = stages));
          return next;
        });
      } catch (e: any) {
        if (cancelled) return;
        setStagesErr(e?.response?.data?.message || e?.message || "Failed to load stages");
      } finally {
        if (!cancelled) setLoadingStages(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeIds, stagesMap]);

  return { stagesMap, loadingStages, stagesErr };
}

export default function TicketDashboardPage() {
  const { filtered, loading, err, reload, filters, setFilters } = useTickets();

  const [mode, setMode] = useState<TicketViewMode>("BOARD");

  // Selection
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
  const details = useTicketDetails(activeTicketId);

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);

  // One confirm modal
  const [confirm, setConfirm] = useState<
    null | { title: string; message: React.ReactNode; onConfirm: () => Promise<void> }
  >(null);

  // Lookups
  const [lookups, setLookups] = useState<{
    ticketTypes: TicketType[];
    companies: any[];
    branches: any[];
    admins: any[];
    contactPersons: any[];
    loaded: boolean;
  }>({
    ticketTypes: [],
    companies: [],
    branches: [],
    admins: [],
    contactPersons: [],
    loaded: false,
  });

  /**
   * ✅ IMPORTANT FIX:
   * Do NOT use Promise.all here. If one endpoint fails (ex: getAdmins 403 for ADMIN),
   * the whole thing fails and ticketTypes stays empty -> board breaks.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const results = await Promise.allSettled([
        listTicketTypes(),
        listCompanies(),
        listBranches(),
        getAdmins(),
        listContactPersons(),
      ]);

      if (cancelled) return;

      const tt = results[0].status === "fulfilled" ? results[0].value : [];
      const cc = results[1].status === "fulfilled" ? results[1].value : [];
      const bb = results[2].status === "fulfilled" ? results[2].value : [];
      const aa = results[3].status === "fulfilled" ? results[3].value : [];
      const cps = results[4].status === "fulfilled" ? results[4].value : [];

      // log failures so you can see which endpoint breaks for ADMIN
      results.forEach((r, i) => {
        if (r.status === "rejected") console.error("Lookup failed index:", i, r.reason);
      });

      setLookups({
        ticketTypes: tt ?? [],
        companies: cc ?? [],
        branches: bb ?? [],
        admins: aa ?? [],
        contactPersons: cps ?? [],
        loaded: true,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Drawer stages: follow opened ticket type (or filter type)
  const stageTypeId =
    (details.ticket as any)?.ticketTypeId ??
    (filters.ticketTypeId === "ALL"
      ? (filtered?.[0] as any)?.ticketTypeId ?? null
      : (filters.ticketTypeId as number));

  const { stages: drawerStages } = useTicketStagesByType(stageTypeId);

  /**
   * ✅ BOARD stages:
   * - Use filter if selected
   * - Else use ticketTypes if available
   * - Else fallback to ticket list typeIds (so board still works even if ticketTypes endpoint fails)
   */
  const visibleTypeIds = useMemo(() => {
    if (filters.ticketTypeId !== "ALL") return [Number(filters.ticketTypeId)].filter(Boolean);

    const fromLookups = (lookups.ticketTypes ?? [])
      .map((t: any) => Number(t.ticketTypeId ?? t.id))
      .filter(Boolean);

    if (fromLookups.length > 0) return fromLookups;

    // fallback: derive from tickets
    return Array.from(new Set((filtered ?? []).map((t: any) => Number(t.ticketTypeId)).filter(Boolean)));
  }, [filters.ticketTypeId, lookups.ticketTypes, filtered]);

  const { stagesMap, loadingStages, stagesErr } = useTicketStagesMapByTypes(visibleTypeIds);

  // ✅ Debug
  useEffect(() => {
    console.log("==== TicketDashboardPage DEBUG ====");
    console.log("mode:", mode);
    console.log("filters.ticketTypeId:", filters.ticketTypeId);
    console.log("filtered tickets:", filtered?.length ?? 0);
    console.log("ticketTypes:", lookups.ticketTypes?.length ?? 0);
    console.log("visibleTypeIds:", visibleTypeIds);
    console.log("stagesMap keys:", Object.keys(stagesMap));
    console.log("loadingStages:", loadingStages);
    console.log("stagesErr:", stagesErr);
    console.log("===================================");
  }, [mode, filters.ticketTypeId, filtered, lookups.ticketTypes, visibleTypeIds, stagesMap, loadingStages, stagesErr]);

  function openTicket(t: Ticket) {
    setActiveTicketId((t as any).ticketId);
  }

  async function doUpdateTicket(ticketId: number, payload: any) {
    try {
      await updateTicket(ticketId, payload);
      toast("Ticket updated ✅");
      await reload();
      await details.reload();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Update failed", true);
    }
  }

  function askDeleteTicket(t: Ticket) {
    setConfirm({
      title: "Delete Ticket?",
      message: (
        <>
          Delete ticket <span className="font-semibold text-slate-900">#{(t as any).ticketId}</span> ?<br />
          This cannot be undone.
        </>
      ),
      onConfirm: async () => {
        try {
          await deleteTicket((t as any).ticketId);
          toast("Ticket deleted ✅");
          setConfirm(null);
          setActiveTicketId(null);
          await reload();
        } catch (e: any) {
          toast(e?.response?.data?.message || e?.message || "Delete failed", true);
        }
      },
    });
  }

  const filteredContactPersons = useMemo(() => {
    if (!details.ticket) return lookups.contactPersons;
    return (lookups.contactPersons ?? []).filter(
      (c: any) => c?.company?.companyId === (details.ticket as any)?.companyId
    );
  }, [lookups.contactPersons, details.ticket]);

  return (
    <div className="p-6 space-y-6">
      <TicketToolbar
        filters={filters}
        setFilters={(fn) => setFilters(fn)}
        ticketTypes={lookups.ticketTypes}
        companies={lookups.companies}
        branches={lookups.branches}
        admins={lookups.admins}
        onCreate={() => setOpenCreate(true)}
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <TicketTabs mode={mode} onChange={setMode} />

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          Showing <span className="font-semibold text-slate-900">{filtered.length}</span>
          {loading ? <span className="ml-2 text-slate-500">• Loading…</span> : null}
        </div>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      {/* BOARD */}
      {mode === "BOARD" && stagesErr && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {stagesErr}
        </div>
      )}

      {mode === "BOARD" && (
        <TicketBoardByTypeView
          tickets={filtered}
          ticketTypes={lookups.ticketTypes}
          stagesMap={stagesMap}
          loadingStages={loadingStages}
          onOpenTicket={openTicket}
        />
      )}

      {/* LIST */}
      {mode === "LIST" && <TicketListView tickets={filtered} onOpenTicket={openTicket} />}

      {/* Create Ticket */}
      <TicketCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={reload}
        companies={lookups.companies}
        branches={lookups.branches}
        ticketTypes={lookups.ticketTypes}
        admins={lookups.admins}
      />

      {/* Ticket details drawer */}
      <TicketDetailsDrawer
        open={!!activeTicketId}
        ticket={details.ticket}
        stages={drawerStages}
        notes={details.notes}
        meetings={details.meetings}
        history={details.history}
        admins={lookups.admins}
        contactPersons={filteredContactPersons}
        loading={details.loading}
        err={details.err}
        onClose={() => setActiveTicketId(null)}
        onRefresh={() => details.reload()}
        onUpdateTicket={(payload) => (activeTicketId ? doUpdateTicket(activeTicketId, payload) : Promise.resolve())}
        onAddNote={async ({ noteTopic, note, stageId }) => {
          if (!activeTicketId) return;
          try {
            await createTicketNote({
              ticketId: activeTicketId,
              stageId: stageId ?? null,
              noteTopic,
              note,
            });
            toast("Note added ✅");
            await details.reload();
          } catch (e: any) {
            toast(e?.response?.data?.message || e?.message || "Add note failed", true);
          }
        }}
        onDeleteTicket={() => {
          if (!details.ticket) return;
          askDeleteTicket(details.ticket as any);
        }}
      />

      {/* Confirm */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? null}
        confirmText="Delete"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return;
          await confirm.onConfirm();
        }}
      />
    </div>
  );
}
