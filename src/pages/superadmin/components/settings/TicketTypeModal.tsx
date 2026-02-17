import React, { useEffect, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Field from "../../../../components/ui/Field";

export type TicketTypeForm = {
  name: string;
  isActive?: boolean; // for edit
};

export default function TicketTypeModal({
  open,
  title,
  subtitle,
  saving,
  defaultValue,
  onClose,
  onSubmit,
  mode, // "create" | "edit"
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  saving?: boolean;
  mode: "create" | "edit";
  defaultValue?: TicketTypeForm;
  onClose: () => void;
  onSubmit: (v: TicketTypeForm) => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName(defaultValue?.name ?? "");
    setIsActive(defaultValue?.isActive ?? true);
  }, [open, defaultValue]);

  if (!open) return null;

  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name: name.trim(), isActive });
        }}
        className="space-y-4"
      >
        <Field label="Ticket Type Name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Recruitment"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
          />
        </Field>

        {mode === "edit" && (
          <div className="rounded-xl border border-slate-100 bg-sky-50 p-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={saving || !name.trim()}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
