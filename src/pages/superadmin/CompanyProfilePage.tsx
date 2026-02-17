import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCompany, updateCompany, type Company } from "../../api/company.api";
import { deleteBranch, listBranches, type Branch } from "../../api/branch.api";

import { Card, Input, Tag, toast } from "./components/companies/ui";
import BranchCreateModal from "./components/companies/BranchCreateModal";

const TZ_DEFAULT = "Asia/Colombo";

export default function CompanyProfilePage() {
  const { companyId } = useParams();
  const id = Number(companyId);
  const nav = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // company edit fields
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [timezoneString, setTimezoneString] = useState(TZ_DEFAULT);

  // branch modal
  const [openAddBranch, setOpenAddBranch] = useState(false);

  const companyInitial = useMemo(
    () => (name?.[0] ? name[0].toUpperCase() : "C"),
    [name]
  );

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const [c, all] = await Promise.all([getCompany(id), listBranches()]);
      setCompany(c);

      setName(c.name ?? "");
      setPhoneNumber(c.phoneNumber ?? "");
      setEmail(c.email ?? "");
      setNote(c.note ?? "");
      setTimezoneString(c.timezoneString ?? TZ_DEFAULT);

      setBranches(all.filter((x) => x.company?.companyId === id));
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load company");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSaveCompany() {
    if (!company) return;

    setSaving(true);
    try {
      const updated = await updateCompany(company.companyId, {
        name,
        phoneNumber: phoneNumber || null,
        email: email || null,
        note: note || null,
        timezoneString: timezoneString || null,
      });
      setCompany(updated);
      toast("Company updated ✅");
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Update failed", true);
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteBranch(branchId: number) {
    const ok = window.confirm("Delete this branch?");
    if (!ok) return;

    try {
      await deleteBranch(branchId);
      toast("Branch deleted ✅");
      await load();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Delete branch failed", true);
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

  if (!company) return <div className="p-6 text-slate-500">Company not found</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => nav("/super/company")}
          className="text-sm font-semibold text-sky-700 hover:underline w-fit"
          type="button"
        >
          ← Back to Companies
        </button>

        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg">
              {companyInitial}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-slate-900">
                {name || company.name}
              </h1>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <Tag>Company ID #{company.companyId}</Tag>
                <Tag tone="sky">{timezoneString || TZ_DEFAULT}</Tag>
                <span className="text-slate-500">
                  {email || "No email"} • {phoneNumber || "No phone"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT: Company Details */}
        <div className="xl:col-span-5">
          <Card
            title="Company Details"
            subtitle="Edit company information"
            right={
              <button
                onClick={onSaveCompany}
                disabled={saving}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
                type="button"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Name" value={name} onChange={setName} />
              <Input label="Phone" value={phoneNumber} onChange={setPhoneNumber} />
              <Input label="Email" value={email} onChange={setEmail} />
              <Input
                label="Timezone"
                value={timezoneString}
                onChange={setTimezoneString}
                placeholder="Asia/Colombo"
              />

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
                  rows={4}
                  placeholder="Notes about this company..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: Branches */}
        <div className="xl:col-span-7">
          <Card
            title="Branches"
            subtitle="Open branch profile or add a new branch"
            right={
              <button
                type="button"
                onClick={() => setOpenAddBranch(true)}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
              >
                + Add Branch
              </button>
            }
          >
            {branches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="text-sm font-semibold text-slate-900">No branches yet</div>
                <div className="mt-1 text-sm text-slate-600">
                  Click <b>Add Branch</b> to create the first one.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {branches.map((b) => (
                  <div
                    key={b.branchId}
                    className="rounded-2xl border border-slate-100 bg-white p-4 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {b.branchName}
                          </div>
                          <Tag tone="sky">{b.branchCode}</Tag>
                          <Tag>ID #{b.branchId}</Tag>
                        </div>

                        <div className="mt-2 text-xs text-slate-500">
                          {b.email ?? "—"} • {b.phoneNumber ?? "—"}
                        </div>

                        <div className="mt-2 text-xs text-slate-600">
                          TZ:{" "}
                          <span className="font-semibold">
                            {b.effectiveTimezone ?? b.timezoneString ?? "—"}
                          </span>
                        </div>

                        {b.address && <div className="mt-2 text-sm text-slate-600">{b.address}</div>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => nav(`/super/company/${company.companyId}/${b.branchId}`)}
                          className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                          type="button"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => onDeleteBranch(b.branchId)}
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

      {/* Add Branch Modal */}
      <BranchCreateModal
        open={openAddBranch}
        companyId={company.companyId}
        onClose={() => setOpenAddBranch(false)}
        onCreated={load}
      />
    </div>
  );
}
