import React, { useMemo, useState } from "react";
import { toast } from "../../utils/toast";
import ConfirmModal from "../../components/ui/ConfirmModal";

import TicketTypeList from "./components/settings/TicketTypeList";
import TicketTypeModal from "./components/settings/TicketTypeModal";
import TicketStagePanel from "./components/settings/TicketStagePanel";
import TicketStageModal from "./components/settings/TicketStageModal";

import { useTicketTypes } from "./hooks/useTicketTypes";
import { useTicketStages } from "./hooks/useTicketStages";

import {
  createTicketType,
  deleteTicketType,
  updateTicketType,
  type TicketType,
} from "../../api/ticketType.api";

import {
  createTicketStage,
  deleteTicketStage,
  updateTicketStage,
  type TicketStage,
} from "../../api/ticketStage.api";

type ConfirmState =
  | null
  | {
      title: string;
      message: React.ReactNode;
      confirmText: string;
      danger?: boolean;
      onConfirm: () => Promise<void>;
    };

export default function SettingsPage() {
  // TYPES
  const { types, loading: loadingTypes, err: typeErr, reload: reloadTypes } = useTicketTypes();
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const selectedType = useMemo(
    () => types.find((t) => t.ticketTypeId === selectedTypeId) ?? null,
    [types, selectedTypeId]
  );

  // STAGES
  const {
    stages,
    loading: loadingStages,
    err: stageErr,
    reload: reloadStages,
  } = useTicketStages(selectedTypeId);

  // MODALS
  const [openCreateType, setOpenCreateType] = useState(false);
  const [editType, setEditType] = useState<TicketType | null>(null);

  const [openCreateStage, setOpenCreateStage] = useState(false);
  const [editStage, setEditStage] = useState<TicketStage | null>(null);

  // SAVING FLAGS
  const [savingType, setSavingType] = useState(false);
  const [savingStage, setSavingStage] = useState(false);

  // ONE CONFIRM MODAL FOR EVERYTHING
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const confirmOpen = !!confirm;

  async function safeReloadAfterTypeChange(nextSelectedId?: number | null) {
    await reloadTypes();
    if (typeof nextSelectedId === "number") setSelectedTypeId(nextSelectedId);
  }

  // ==========================
  // Ticket Type handlers
  // ==========================
  async function onCreateType(v: { name: string }) {
    setSavingType(true);
    try {
      const created = await createTicketType({ name: v.name });
      toast("Ticket type created ✅");
      setOpenCreateType(false);
      await safeReloadAfterTypeChange(created.ticketTypeId);
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Create ticket type failed", true);
    } finally {
      setSavingType(false);
    }
  }

  async function onUpdateType(typeId: number, payload: { name: string; isActive: boolean }) {
    setSavingType(true);
    try {
      await updateTicketType(typeId, payload);
      toast("Ticket type updated ✅");
      setEditType(null);
      await reloadTypes();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Update ticket type failed", true);
    } finally {
      setSavingType(false);
    }
  }

  function askDeleteType(t: TicketType) {
    setConfirm({
      title: "Delete Ticket Type?",
      message: (
        <>
          You are going to delete <span className="font-semibold text-slate-900">{t.name}</span>.
          <br />
          Stages under this type may also be affected. This cannot be undone.
        </>
      ),
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          await deleteTicketType(t.ticketTypeId);
          toast("Ticket type deleted ✅");
          // if deleted selected type, clear selection
          if (selectedTypeId === t.ticketTypeId) setSelectedTypeId(null);
          await reloadTypes();
          setConfirm(null);
        } catch (e: any) {
          toast(e?.response?.data?.message || e?.message || "Delete failed", true);
        }
      },
    });
  }

  // ==========================
  // Ticket Stage handlers
  // ==========================
  async function onCreateStage(v: {
    stageName: string;
    stageOrder: number;
    isFinal: boolean;
    isActive: boolean;
  }) {
    if (!selectedTypeId) return;

    setSavingStage(true);
    try {
      await createTicketStage({
        ticketTypeId: selectedTypeId,
        stageName: v.stageName,
        stageOrder: v.stageOrder,
        isFinal: v.isFinal,
        isActive: v.isActive,
      });
      toast("Stage created ✅");
      setOpenCreateStage(false);
      await reloadStages();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Create stage failed", true);
    } finally {
      setSavingStage(false);
    }
  }

  async function onUpdateStage(
    stageId: number,
    payload: { stageName: string; stageOrder: number; isFinal: boolean; isActive: boolean }
  ) {
    setSavingStage(true);
    try {
      await updateTicketStage(stageId, payload);
      toast("Stage updated ✅");
      setEditStage(null);
      await reloadStages();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Update stage failed", true);
    } finally {
      setSavingStage(false);
    }
  }

  function askDeleteStage(s: TicketStage) {
    setConfirm({
      title: "Delete Stage?",
      message: (
        <>
          Delete stage <span className="font-semibold text-slate-900">{s.stageName}</span> ?
          <br />
          This cannot be undone.
        </>
      ),
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          await deleteTicketStage(s.stageId);
          toast("Stage deleted ✅");
          await reloadStages();
          setConfirm(null);
        } catch (e: any) {
          toast(e?.response?.data?.message || e?.message || "Delete failed", true);
        }
      },
    });
  }

  // auto-select first type if none selected (better UX)
  const canAutoSelect =
    !selectedTypeId && !loadingTypes && types.length > 0 && !typeErr;

  if (canAutoSelect) {
    // safe (small) state set during render, but better to do with useEffect.
    // If you want strict-mode safe, move this to useEffect.
    setSelectedTypeId(types[0].ticketTypeId);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage Ticket Types and their Ticket Stages (Super Admin only).
        </p>
      </div>

      {/* Errors */}
      {typeErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {typeErr}
        </div>
      )}

      {/* 2 columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5">
          <TicketTypeList
            types={types}
            selectedId={selectedTypeId}
            onSelect={setSelectedTypeId}
            onAdd={() => setOpenCreateType(true)}
            onEdit={(t) => setEditType(t)}
            onDelete={askDeleteType}
          />

          {loadingTypes && (
            <div className="mt-3 text-sm text-slate-500">Loading ticket types…</div>
          )}
        </div>

        <div className="xl:col-span-7">
          <TicketStagePanel
            selectedType={selectedType}
            stages={stages}
            loading={loadingStages}
            err={stageErr}
            onAdd={() => setOpenCreateStage(true)}
            onEdit={(s) => setEditStage(s)}
            onDelete={askDeleteStage}
          />
        </div>
      </div>

      {/* Create Type */}
      <TicketTypeModal
        open={openCreateType}
        mode="create"
        title="Add Ticket Type"
        subtitle="Example: Recruitment, Support, Sales…"
        saving={savingType}
        onClose={() => setOpenCreateType(false)}
        onSubmit={(v) => onCreateType({ name: v.name })}
      />

      {/* Edit Type */}
      {editType && (
        <TicketTypeModal
          open={!!editType}
          mode="edit"
          title="Edit Ticket Type"
          subtitle={`Type ID #${editType.ticketTypeId}`}
          saving={savingType}
          defaultValue={{ name: editType.name, isActive: editType.isActive }}
          onClose={() => setEditType(null)}
          onSubmit={(v) =>
            onUpdateType(editType.ticketTypeId, {
              name: v.name,
              isActive: !!v.isActive,
            })
          }
        />
      )}

      {/* Create Stage */}
      <TicketStageModal
        open={openCreateStage}
        title="Add Stage"
        subtitle={selectedType ? `Under: ${selectedType.name}` : "Select a type first"}
        saving={savingStage}
        defaultValue={{ stageName: "", stageOrder: (stages.length || 0) + 1, isFinal: false, isActive: true }}
        onClose={() => setOpenCreateStage(false)}
        onSubmit={onCreateStage}
      />

      {/* Edit Stage (✅ FIXED - no duplicate isActive) */}
      {editStage && (
        <TicketStageModal
          open={!!editStage}
          title="Edit Stage"
          subtitle={`Under: ${editStage.ticketTypeName}`}
          saving={savingStage}
          defaultValue={{
            stageName: editStage.stageName,
            stageOrder: editStage.stageOrder,
            isFinal: editStage.isFinal,
            isActive: editStage.isActive,
          }}
          onClose={() => setEditStage(null)}
          onSubmit={(v) =>
            onUpdateStage(editStage.stageId, {
              stageName: v.stageName,
              stageOrder: v.stageOrder,
              isFinal: v.isFinal,
              isActive: v.isActive,
            })
          }
        />
      )}

      {/* ONE Confirm modal used for both deletes */}
      <ConfirmModal
        open={confirmOpen}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? null}
        confirmText={confirm?.confirmText ?? "Confirm"}
        danger={confirm?.danger}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return;
          await confirm.onConfirm();
        }}
      />
    </div>
  );
}
