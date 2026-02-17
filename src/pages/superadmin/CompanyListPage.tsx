// src/pages/superadmin/pages/CompanyListPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteCompany, type Company } from "../../api/company.api";

import CompanyCard from "./components/companies/CompanyCard";
import CompanyCreateModal from "./components/companies/CompanyCreateModal";
import { useCompanies, useCompanySearch } from "./hooks/useCompanies";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function CompanyListPage() {
  const nav = useNavigate();

  const { companies, loading, err, reload } = useCompanies();

  const [q, setQ] = useState("");
  const filtered = useCompanySearch(companies, q);

  const [openAdd, setOpenAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);

  const stats = useMemo(
    () => ({ total: companies.length, showing: filtered.length }),
    [companies.length, filtered.length]
  );

  async function onDeleteConfirmed() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteCompany(deleteTarget.companyId);
      setDeleteTarget(null);
      await reload();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-sky-700">
              Super Admin / Company Management
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Companies</h1>
            <p className="mt-1 text-sm text-slate-600">
              View, create, and manage companies. Click a company to open the profile.
            </p>
          </div>

          <button
            onClick={() => setOpenAdd(true)}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-200"
            type="button"
          >
            + Add Company
          </button>
        </div>

        {/* Search + Stats */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600">Search</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, phone, timezone..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
              />
            </div>

            <div className="flex gap-3">
              <MiniStat label="Total" value={stats.total} />
              <MiniStat label="Showing" value={stats.showing} />
            </div>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>

      {/* Company Cards */}
      <div className="mt-6">
        {loading ? (
          <div className="text-slate-500">Loading companies...</div>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => setOpenAdd(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <CompanyCard
                key={c.companyId}
                c={c}
                onOpen={() => nav(`/super/company/${c.companyId}`)}
                onDelete={() => setDeleteTarget(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CompanyCreateModal open={openAdd} onClose={() => setOpenAdd(false)} onCreated={reload} />

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Company?"
        message={
          deleteTarget ? (
            <>
              You are going to delete{" "}
              <span className="font-semibold text-slate-900">{deleteTarget.name}</span>.
              <br />
              This action cannot be undone.
            </>
          ) : null
        }
        confirmText={deleting ? "Deleting..." : "Delete"}
        danger
        disabled={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onDeleteConfirmed}
      />
    </div>
  );
}

/* Small UI bits */

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-sky-50 px-4 py-3">
      <div className="text-[11px] font-semibold text-slate-600">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-700 font-bold">
        C
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">No companies yet</h3>
      <p className="mt-1 text-sm text-slate-600">
        Create your first company to start adding branches and contact persons.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
        type="button"
      >
        + Add Company
      </button>
    </div>
  );
}
