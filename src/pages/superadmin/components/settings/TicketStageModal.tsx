import React, { useEffect, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Field from "../../../../components/ui/Field";

export type TicketStageForm = {
  stageName: string;
  stageOrder: number;
  isFinal: boolean;
  isActive: boolean;
};

export default function TicketStageModal({
  open,
  title,
  subtitle,
  saving,
  defaultValue,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  saving?: boolean;
  defaultValue?: TicketStageForm;
  onClose: () => void;
  onSubmit: (v: TicketStageForm) => void | Promise<void>;
}) {
  const [stageName, setStageName] = useState("");
  const [stageOrder, setStageOrder] = useState<number>(1);
  const [isFinal, setIsFinal] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setStageName(defaultValue?.stageName ?? "");
    setStageOrder(defaultValue?.stageOrder ?? 1);
    setIsFinal(defaultValue?.isFinal ?? false);
    setIsActive(defaultValue?.isActive ?? true);
  }, [open, defaultValue]);

  if (!open) return null;

  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            stageName: stageName.trim(),
            stageOrder: Number(stageOrder),
            isFinal,
            isActive,
          });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Stage Name" required>
            <input
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              required
              placeholder="CV Screening"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            />
          </Field>

          <Field label="Stage Order" required>
            <input
              type="number"
              value={stageOrder}
              onChange={(e) => setStageOrder(Number(e.target.value))}
              min={1}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-100 bg-sky-50 p-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isFinal}
                onChange={(e) => setIsFinal(e.target.checked)}
              />
              Final stage
            </label>
            <div className="mt-1 text-xs text-slate-500">
              If final is ON, this stage can represent “Completed / Done”.
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-sky-50 p-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
            <div className="mt-1 text-xs text-slate-500">
              Inactive stages won’t be selectable in flows.
            </div>
          </div>
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
            disabled={saving || !stageName.trim()}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
