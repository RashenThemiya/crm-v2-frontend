import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Field from "../../../../components/ui/Field";
import { createTicket } from "../../../../api/ticket.api";
import { listTicketStages, type TicketStage } from "../../../../api/ticketStage.api";
import { toast } from "../../../../utils/toast";

export default function TicketCreateModal({
  open,
  onClose,
  onCreated,
  companies,
  branches,
  ticketTypes,
  admins,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
  companies: Array<{ companyId: number; name: string }>;
  branches: Array<{ branchId: number; branchName: string; company?: { companyId: number } }>;
  ticketTypes: Array<{ ticketTypeId: number; name: string }>;
  admins: Array<{ adminId: number; username: string }>;
}) {
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<number | "">("");
  const [branchId, setBranchId] = useState<number | "">("");
  const [ticketTypeId, setTicketTypeId] = useState<number | "">("");
  const [initialStageId, setInitialStageId] = useState<number | "">("");
  const [assignedAdminId, setAssignedAdminId] = useState<number | "NONE">("NONE");

  const [stages, setStages] = useState<TicketStage[]>([]);

  const branchOptions = useMemo(() => {
    if (!companyId) return [];
    return branches.filter((b) => b.company?.companyId === companyId);
  }, [branches, companyId]);

  useEffect(() => {
    if (!open) return;
    setCompanyId("");
    setBranchId("");
    setTicketTypeId("");
    setInitialStageId("");
    setAssignedAdminId("NONE");
    setStages([]);
  }, [open]);

  useEffect(() => {
    async function loadStages() {
      if (!ticketTypeId) {
        setStages([]);
        setInitialStageId("");
        return;
      }
      const s = await listTicketStages(ticketTypeId);
      const sorted = s.slice().sort((a, b) => a.stageOrder - b.stageOrder);
      setStages(sorted);
      setInitialStageId(sorted[0]?.stageId ?? "");
    }
    loadStages();
  }, [ticketTypeId]);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId || !branchId || !ticketTypeId || !initialStageId) return;

    setSaving(true);
    try {
      await createTicket({
        companyId,
        branchId,
        ticketTypeId,
        initialStageId,
        assignedAdminId: assignedAdminId === "NONE" ? null : assignedAdminId,
      });
      toast("Ticket created ✅");
      onClose();
      await onCreated();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Create ticket failed", true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Create Ticket" subtitle="Quick create (like Jira)" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Company" required>
            <select
              value={companyId === "" ? "" : String(companyId)}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : "";
                setCompanyId(v);
                setBranchId("");
              }}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none"
            >
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c.companyId} value={c.companyId}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Branch" required>
            <select
              value={branchId === "" ? "" : String(branchId)}
              onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : "")}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none"
              disabled={!companyId}
            >
              <option value="">Select branch</option>
              {branchOptions.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Ticket Type" required>
            <select
              value={ticketTypeId === "" ? "" : String(ticketTypeId)}
              onChange={(e) => setTicketTypeId(e.target.value ? Number(e.target.value) : "")}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none"
            >
              <option value="">Select type</option>
              {ticketTypes.map((t) => (
                <option key={t.ticketTypeId} value={t.ticketTypeId}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Initial Stage" required>
            <select
              value={initialStageId === "" ? "" : String(initialStageId)}
              onChange={(e) => setInitialStageId(e.target.value ? Number(e.target.value) : "")}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none"
              disabled={!ticketTypeId}
            >
              <option value="">Select stage</option>
              {stages.map((s) => (
                <option key={s.stageId} value={s.stageId}>
                  {s.stageOrder}. {s.stageName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Assign to (optional)">
            <select
              value={assignedAdminId === "NONE" ? "NONE" : String(assignedAdminId)}
              onChange={(e) => setAssignedAdminId(e.target.value === "NONE" ? "NONE" : Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none"
            >
              <option value="NONE">Unassigned</option>
              {admins.map((a) => (
                <option key={a.adminId} value={a.adminId}>
                  {a.username}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
