import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBranch, updateBranch, type Branch } from "../../api/branch.api";
import {
  deleteContactPerson,
  listContactPersons,
  updateContactPerson,
  type ContactPerson,
} from "../../api/contactPerson.api";

import { Card, Input, Tag, toast } from "./components/companies/ui";
import ContactCreateModal from "./components/companies/ContactCreateModal";

const TZ_DEFAULT = "Asia/Colombo";

export default function BranchProfilePage() {
  const { branchId } = useParams();
  const id = Number(branchId);
  const nav = useNavigate();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Branch edit fields
  const [saving, setSaving] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [timezoneString, setTimezoneString] = useState(TZ_DEFAULT);

  // Contact modal
  const [openAddContact, setOpenAddContact] = useState(false);

  const branchInitial = useMemo(
    () => (branchName?.[0] ? branchName[0].toUpperCase() : "B"),
    [branchName]
  );

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const b = await getBranch(id);
      setBranch(b);

      setBranchName(b.branchName ?? "");
      setBranchCode(b.branchCode ?? "");
      setAddress(b.address ?? "");
      setPhoneNumber(b.phoneNumber ?? "");
      setEmail(b.email ?? "");
      setTimezoneString(b.effectiveTimezone ?? b.timezoneString ?? TZ_DEFAULT);

      const cps = await listContactPersons({ branchId: id });
      setContacts(cps);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load branch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSaveBranch() {
    if (!branch) return;

    setSaving(true);
    try {
      const updated = await updateBranch(branch.branchId, {
        branchName,
        branchCode,
        address: address || null,
        phoneNumber: phoneNumber || null,
        email: email || null,
        timezoneString: timezoneString || null,
      });
      setBranch(updated);
      toast("Branch updated ✅");
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Update failed", true);
    } finally {
      setSaving(false);
    }
  }

  async function onToggleActive(cp: ContactPerson) {
    try {
      await updateContactPerson(cp.id, {
        branchId: cp.branch?.branchId ?? null,
        name: cp.name,
        position: cp.position ?? null,
        email: cp.email ?? null,
        phoneNumber: cp.phoneNumber ?? null,
        isActive: !cp.isActive,
      });
      toast(cp.isActive ? "Deactivated ✅" : "Activated ✅");
      await load();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Update failed", true);
    }
  }

  async function onDeleteContact(contactId: number) {
    const ok = window.confirm("Delete this contact person?");
    if (!ok) return;

    try {
      await deleteContactPerson(contactId);
      toast("Contact deleted ✅");
      await load();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Delete failed", true);
    }
  }

  if (loading) return <div className="p-6 text-slate-500">Loading...</div>;

  if (err) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {err}
        </div>
      </div>
    );
  }

  if (!branch) return <div className="p-6 text-slate-500">Branch not found</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => nav(`/super/company/${branch.company.companyId}`)}
          className="text-sm font-semibold text-sky-700 hover:underline w-fit"
          type="button"
        >
          ← Back to Company
        </button>

        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg">
              {branchInitial}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-slate-900">
                {branchName || branch.branchName}
              </h1>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <Tag>Branch ID #{branch.branchId}</Tag>
                <Tag tone="sky">{branchCode || branch.branchCode}</Tag>
                <Tag tone="sky">{timezoneString || TZ_DEFAULT}</Tag>
                <span className="text-slate-500 truncate">
                  {branch.company.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT: Branch details */}
        <div className="xl:col-span-5">
          <Card
            title="Branch Details"
            subtitle="Edit branch information"
            right={
              <button
                onClick={onSaveBranch}
                disabled={saving}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
                type="button"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Branch Name" value={branchName} onChange={setBranchName} />
              <Input label="Branch Code" value={branchCode} onChange={setBranchCode} />
              <Input label="Phone" value={phoneNumber} onChange={setPhoneNumber} />
              <Input label="Email" value={email} onChange={setEmail} />
              <div className="sm:col-span-2">
                <Input label="Address" value={address} onChange={setAddress} />
              </div>
              <Input
                label="Timezone (optional)"
                value={timezoneString}
                onChange={setTimezoneString}
                placeholder="Asia/Colombo"
              />
            </div>
          </Card>
        </div>

        {/* RIGHT: Contacts */}
        <div className="xl:col-span-7">
          <Card
            title="Contact Persons"
            subtitle="Manage contact persons for this branch"
            right={
              <button
                type="button"
                onClick={() => setOpenAddContact(true)}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
              >
                + Add Contact
              </button>
            }
          >
            {contacts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="text-sm font-semibold text-slate-900">No contact persons</div>
                <div className="mt-1 text-sm text-slate-600">
                  Click <b>Add Contact</b> to create the first one.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {contacts.map((cp) => (
                  <div
                    key={cp.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {cp.name}
                        </div>
                        {cp.position && (
                          <div className="mt-1 text-xs text-slate-600">{cp.position}</div>
                        )}

                        <div className="mt-2 text-xs text-slate-500">
                          {cp.email ?? "—"} • {cp.phoneNumber ?? "—"}
                        </div>

                        <div className="mt-3">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border",
                              cp.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-red-50 text-red-700 border-red-100",
                            ].join(" ")}
                          >
                            {cp.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onToggleActive(cp)}
                          className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                          type="button"
                        >
                          {cp.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => onDeleteContact(cp.id)}
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Contact Modal */}
      <ContactCreateModal
        open={openAddContact}
        onClose={() => setOpenAddContact(false)}
        companyId={branch.company.companyId}
        branchId={branch.branchId}
        onCreated={load}
      />
    </div>
  );
}
