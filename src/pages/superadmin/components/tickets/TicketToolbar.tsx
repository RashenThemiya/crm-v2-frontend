import React from "react";
import type { TicketFilters } from "../../hooks/useTickets";
import type { TicketStatus } from "../../../../api/ticket.api";

const statuses: Array<TicketStatus | "ALL"> = ["ALL", "OPEN", "ON_HOLD", "CLOSED", "CANCELED"];

export default function TicketToolbar({
  filters,
  setFilters,
  ticketTypes,
  companies,
  branches,
  admins,
  onCreate,
}: {
  filters: TicketFilters;
  setFilters: (fn: (p: TicketFilters) => TicketFilters) => void;
  ticketTypes: Array<{ ticketTypeId: number; name: string }>;
  companies: Array<{ companyId: number; name: string }>;
  branches: Array<{ branchId: number; branchName: string; company?: { companyId: number } }>;
  admins: Array<{ adminId: number; username: string }>;
  onCreate: () => void;
}) {
  const branchOptions =
    filters.companyId === "ALL"
      ? branches
      : branches.filter((b) => b.company?.companyId === filters.companyId);

  return (
    <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs font-semibold text-sky-700">Admin / Tickets</div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Ticket Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Board + List.</p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 shadow-sm"
        >
          + Create Ticket
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
        <input
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          placeholder="Search #id, company, branch, stage, assignee..."
          className="xl:col-span-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
        />

        <Select
          label="Status"
          value={filters.status}
          onChange={(v) => setFilters((p) => ({ ...p, status: v as any }))}
          options={statuses.map((s) => ({ value: s, label: s }))}
        />

        <Select
          label="Type"
          value={filters.ticketTypeId}
          onChange={(v) => setFilters((p) => ({ ...p, ticketTypeId: v === "ALL" ? "ALL" : Number(v) }))}
          options={[
            { value: "ALL", label: "All types" },
            ...ticketTypes.map((t) => ({ value: String(t.ticketTypeId), label: t.name })),
          ]}
        />

        <Select
          label="Company"
          value={filters.companyId}
          onChange={(v) =>
            setFilters((p) => ({
              ...p,
              companyId: v === "ALL" ? "ALL" : Number(v),
              branchId: "ALL",
            }))
          }
          options={[
            { value: "ALL", label: "All companies" },
            ...companies.map((c) => ({ value: String(c.companyId), label: c.name })),
          ]}
        />

        <Select
          label="Branch"
          value={filters.branchId}
          onChange={(v) => setFilters((p) => ({ ...p, branchId: v === "ALL" ? "ALL" : Number(v) }))}
          options={[
            { value: "ALL", label: "All branches" },
            ...branchOptions.map((b) => ({ value: String(b.branchId), label: b.branchName })),
          ]}
        />

        <Select
          label="Assignee"
          value={filters.assignedAdminId}
          onChange={(v) => setFilters((p) => ({ ...p, assignedAdminId: v === "ALL" ? "ALL" : Number(v) }))}
          options={[
            { value: "ALL", label: "Anyone" },
            ...admins.map((a) => ({ value: String(a.adminId), label: a.username })),
          ]}
        />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
      <div className="text-[11px] font-semibold text-slate-600">{label}</div>
      <select
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
