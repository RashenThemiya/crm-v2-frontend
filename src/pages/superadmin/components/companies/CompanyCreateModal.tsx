import React, { useMemo, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Field from "../../../../components/ui/Field";
import { createCompany } from "../../../../api/company.api";

const TZ_DEFAULT = "Asia/Colombo";

export default function CompanyCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [timezoneString, setTimezoneString] = useState(TZ_DEFAULT);

  // ✅ Timezones list (modern browsers)
  const timezones = useMemo(() => {
    const anyIntl = Intl as any;
    if (typeof anyIntl.supportedValuesOf === "function") {
      return anyIntl.supportedValuesOf("timeZone") as string[];
    }
    // fallback list (if old browser)
    return [
      "Asia/Colombo",
      "UTC",
      "Asia/Dubai",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Europe/London",
      "Europe/Berlin",
      "America/New_York",
      "America/Los_Angeles",
      "Australia/Sydney",
    ];
  }, []);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");

    try {
      await createCompany({
        name,
        phoneNumber: phoneNumber || null,
        email: email || null,
        note: note || null,
        timezoneString: timezoneString || null,
      });

      setName("");
      setPhoneNumber("");
      setEmail("");
      setNote("");
      setTimezoneString(TZ_DEFAULT);

      onClose();
      await onCreated();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to create company");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Add New Company"
      subtitle="Fill the company details. You can edit later too."
      onClose={onClose}
    >
      {err && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Company Name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            />
          </Field>

          {/* ✅ DROPDOWN HERE */}
          <Field label="Timezone">
            <select
              value={timezoneString}
              onChange={(e) => setTimezoneString(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Phone">
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            />
          </Field>

          <Field label="Email">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Note">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
              />
            </Field>
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
            disabled={saving}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Company"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
