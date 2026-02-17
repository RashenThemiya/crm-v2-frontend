import React, { useState } from "react";
import { createBranch } from "../../../../api/branch.api";
import { Input, Modal, Select, toast } from "./ui";

const TZ_DEFAULT = "Asia/Colombo";
const TIMEZONES = [
  "Asia/Colombo",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Bangkok",
  "Asia/Kuala_Lumpur",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
];

export default function BranchCreateModal({
  open,
  companyId,
  onClose,
  onCreated,
}: {
  open: boolean;
  companyId: number;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}) {
  const [adding, setAdding] = useState(false);

  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [timezoneString, setTimezoneString] = useState(TZ_DEFAULT);

  if (!open) return null;

  function reset() {
    setBranchName("");
    setBranchCode("");
    setAddress("");
    setPhoneNumber("");
    setEmail("");
    setTimezoneString(TZ_DEFAULT);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);

    try {
      await createBranch({
        companyId,
        branchName,
        branchCode,
        address: address || null,
        phoneNumber: phoneNumber || null,
        email: email || null,
        timezoneString: timezoneString || null,
      });

      toast("Branch created ✅");
      onClose();
      reset();
      await onCreated();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Create branch failed", true);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Modal
      title="Add Branch"
      subtitle="Create a branch under this company"
      onClose={() => {
        onClose();
        reset();
      }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Branch Name" value={branchName} onChange={setBranchName} required />
          <Input label="Branch Code" value={branchCode} onChange={setBranchCode} required />
          <Input label="Address" value={address} onChange={setAddress} />
          <Input label="Phone" value={phoneNumber} onChange={setPhoneNumber} />
          <Input label="Email" value={email} onChange={setEmail} />

          <Select
            label="Timezone"
            value={timezoneString}
            onChange={setTimezoneString}
            options={TIMEZONES}
            required
          />
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
            {adding ? "Creating..." : "Create Branch"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
