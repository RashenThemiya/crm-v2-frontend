import React from "react";
import type { Company } from "../../../../api/company.api";
import Badge from "../../../../components/ui/Badge";

export default function CompanyCard({
  c,
  onOpen,
  onDelete,
}: {
  c: Company;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onOpen} className="min-w-0 text-left" type="button">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold">
              {c.name?.[0]?.toUpperCase() || "C"}
            </div>

            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-slate-900 group-hover:text-sky-700">
                {c.name}
              </div>
              <div className="mt-0.5 text-xs text-slate-500 truncate">
                {c.email ?? "No email"} • {c.phoneNumber ?? "No phone"}
              </div>
            </div>
          </div>

          {c.note && (
            <div className="mt-3 text-sm text-slate-600 line-clamp-2">{c.note}</div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{c.timezoneString ?? "No timezone"}</Badge>
            <Badge tone="soft">ID #{c.companyId}</Badge>
          </div>
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={onOpen}
            className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
            type="button"
          >
            Open
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
