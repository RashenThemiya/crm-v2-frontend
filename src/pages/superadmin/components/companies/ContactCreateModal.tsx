import React, { useState } from "react";
import { createContactPerson } from "../../../../api/contactPerson.api";
import { Input, Modal, toast } from "./ui";

export default function ContactCreateModal({
  open,
  onClose,
  companyId,
  branchId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  companyId: number;
  branchId: number;
  onCreated: () => Promise<void> | void;
}) {
  const [adding, setAdding] = useState(false);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  if (!open) return null;

  function reset() {
    setName("");
    setPosition("");
    setEmail("");
    setPhoneNumber("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);

    try {
      await createContactPerson({
        companyId,
        branchId,
        name,
        position: position || null,
        email: email || null,
        phoneNumber: phoneNumber || null,
      });

      toast("Contact person created ✅");
      onClose();
      reset();
      await onCreated();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Create contact failed", true);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Modal
      title="Add Contact Person"
      subtitle="Add a contact person for this branch"
      onClose={() => {
        onClose();
        reset();
      }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Name" value={name} onChange={setName} required />
          <Input label="Position" value={position} onChange={setPosition} placeholder="HR Manager" />
          <Input label="Email" value={email} onChange={setEmail} placeholder="name@company.com" />
          <Input label="Phone" value={phoneNumber} onChange={setPhoneNumber} placeholder="0771234567" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              reset();
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            disabled={adding}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add Contact"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
