import React, { useEffect, useMemo, useState } from "react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { toast } from "../../utils/toast";

import {
  listJobPostings,
  deleteJobPosting,
  updateJobPosting,
  updateJobPostingMultipart,
  type JobPosting,
  type JobStatus,
  type UpdateJobPostingDTO,
} from "../../api/jobPosting.api";

import JobUpsertModal from "./components/jobs/JobUpsertModal";
import JobDetailsDrawer from "./components/jobs/JobDetailsDrawer";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function fmtColombo(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function isExpired(expireAtUtc?: string | null) {
  if (!expireAtUtc) return false;
  return new Date(expireAtUtc).getTime() < Date.now();
}

function StatusPill({ status, expired }: { status: JobStatus; expired: boolean }) {
  if (status === "PUBLISHED" && expired) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 bg-rose-50 text-rose-700 ring-rose-200">
        EXPIRED
      </span>
    );
  }

  const cls =
    status === "PUBLISHED"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "CLOSED"
      ? "bg-slate-100 text-slate-700 ring-slate-200"
      : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1", cls)}>
      {status}
    </span>
  );
}

/** yyyy-mm-dd -> Date at start of day (local) */
function startOfDayLocal(yyyyMMdd: string) {
  const [y, m, d] = yyyyMMdd.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

/** yyyy-mm-dd -> Date at end of day (local) */
function endOfDayLocal(yyyyMMdd: string) {
  const [y, m, d] = yyyyMMdd.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);
}

function parseIsoSafe(iso?: string | null) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

// ✅ helper for nullable strings coming from backend
function s(v: string | null | undefined, fallback = "-") {
  const t = (v ?? "").trim();
  return t ? t : fallback;
}

export default function SuperAdminJobDashboardPage() {
  const [items, setItems] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal + drawer
  const [openUpsert, setOpenUpsert] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);

  // filters
  const [status, setStatus] = useState<JobStatus | "ALL">("ALL");
  const [companyId, setCompanyId] = useState<number | "ALL">("ALL");
  const [q, setQ] = useState("");

  // date filter (Created date)
  const [datePreset, setDatePreset] = useState<"ALL" | "7D" | "30D">("ALL");
  const [dateFrom, setDateFrom] = useState<string>(""); // yyyy-mm-dd
  const [dateTo, setDateTo] = useState<string>(""); // yyyy-mm-dd

  // confirm modal (delete)
  const [confirm, setConfirm] = useState<
    null | { title: string; message: React.ReactNode; onConfirm: () => Promise<void> }
  >(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await listJobPostings();
      data.sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime());
      setItems(data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load job postings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const companies = useMemo(() => {
    const map = new Map<number, string>();
    for (const j of items) map.set(j.companyId, s(j.companyName, "Unknown Company"));
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const activeJob = useMemo(
    () => (activeJobId ? items.find((x) => x.jobPostingId === activeJobId) ?? null : null),
    [activeJobId, items]
  );

  async function doUpdateJob(jobPostingId: number, payload: UpdateJobPostingDTO) {
    try {
      await updateJobPosting(jobPostingId, payload);
      toast("Job updated ✅");
      await load();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Update failed", true);
    }
  }

  async function doUpdateJobPhoto(jobPostingId: number, payload: UpdateJobPostingDTO, photo: File) {
    try {
      await updateJobPostingMultipart(jobPostingId, payload, photo);
      toast("Job updated + image ✅");
      await load();
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || "Update failed", true);
    }
  }

  function askDeleteJob(job: JobPosting) {
    setConfirm({
      title: "Delete Job Posting?",
      message: (
        <>
          Delete job <span className="font-semibold text-slate-900">#{job.jobPostingId}</span> ?
          <br />
          This cannot be undone.
        </>
      ),
      onConfirm: async () => {
        try {
          await deleteJobPosting(job.jobPostingId);
          toast("Job deleted ✅");
          setConfirm(null);
          if (activeJobId === job.jobPostingId) setActiveJobId(null);
          await load();
        } catch (e: any) {
          toast(e?.response?.data?.message || e?.message || "Delete failed", true);
        }
      },
    });
  }

  const createdBounds = useMemo(() => {
    if (datePreset === "7D" || datePreset === "30D") {
      const days = datePreset === "7D" ? 7 : 30;
      const from = Date.now() - days * 24 * 60 * 60 * 1000;
      return { fromMs: from, toMs: Date.now() };
    }

    const fromMs = dateFrom ? startOfDayLocal(dateFrom).getTime() : null;
    const toMs = dateTo ? endOfDayLocal(dateTo).getTime() : null;
    return { fromMs, toMs };
  }, [datePreset, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return items.filter((j) => {
      const okStatus = status === "ALL" ? true : j.status === status;
      const okCompany = companyId === "ALL" ? true : j.companyId === companyId;

      const jobRole = s(j.jobRole, "").toLowerCase();
      const companyName = s(j.companyName, "").toLowerCase();
      const branchName = s(j.branchName, "").toLowerCase();

      const okQ = !qq || jobRole.includes(qq) || companyName.includes(qq) || branchName.includes(qq);

      const createdMs = parseIsoSafe(j.createdAtUtc);
      const fromMs = createdBounds.fromMs;
      const toMs = createdBounds.toMs;

      const okDate =
        (!fromMs || (createdMs !== null && createdMs >= fromMs)) &&
        (!toMs || (createdMs !== null && createdMs <= toMs));

      return okStatus && okCompany && okQ && okDate;
    });
  }, [items, status, companyId, q, createdBounds]);

  const stats = useMemo(() => {
    const total = items.length;
    const draft = items.filter((x) => x.status === "DRAFT").length;
    const published = items.filter((x) => x.status === "PUBLISHED").length;
    const closed = items.filter((x) => x.status === "CLOSED").length;
    const expiredUi = items.filter((x) => x.status === "PUBLISHED" && isExpired(x.expireAtUtc)).length;
    return { total, draft, published, closed, expiredUi };
  }, [items]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Postings</h1>
          <p className="text-slate-600">Create, publish and manage job ads</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            Refresh
          </button>

          <button
            onClick={() => {
              setEditingJob(null);
              setOpenUpsert(true);
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            type="button"
          >
            + New Job
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-700">Total</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-700">Draft</div>
          <div className="mt-2 text-2xl font-bold text-amber-700">{stats.draft}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-700">Published</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{stats.published}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-700">Closed</div>
          <div className="mt-2 text-2xl font-bold text-slate-700">{stats.closed}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
          <div className="text-sm font-semibold text-slate-700">Expired (UI)</div>
          <div className="mt-2 text-2xl font-bold text-rose-700">{stats.expiredUi}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["ALL", "PUBLISHED", "CLOSED", "DRAFT"] as const).map((s0) => (
              <button
                key={s0}
                onClick={() => setStatus(s0)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition",
                  status === s0
                    ? "bg-indigo-600 text-white ring-indigo-600"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                )}
                type="button"
              >
                {s0}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={companyId === "ALL" ? "ALL" : String(companyId)}
              onChange={(e) => setCompanyId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="ALL">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jobRole / company / branch..."
              className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Date Filter Row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="text-xs font-semibold text-slate-600 mr-1">Created:</div>

            {(["ALL", "7D", "30D"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setDatePreset(p);
                  if (p !== "ALL") {
                    setDateFrom("");
                    setDateTo("");
                  }
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition",
                  datePreset === p
                    ? "bg-slate-900 text-white ring-slate-900"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                )}
              >
                {p === "ALL" ? "All" : p === "7D" ? "Last 7 days" : "Last 30 days"}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-600">From</div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDatePreset("ALL");
                  setDateFrom(e.target.value);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-600">To</div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDatePreset("ALL");
                  setDateTo(e.target.value);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setDatePreset("ALL");
                setDateFrom("");
                setDateTo("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 text-slate-600">
          Loading job postings...
        </div>
      ) : err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{err}</div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="font-semibold text-slate-900">Results: {filtered.length}</div>
            <div className="text-xs text-slate-500">Click a row to open details drawer</div>
          </div>

          <div className="max-h-[calc(100vh-420px)] min-h-[280px] overflow-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
                <tr className="text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3">Job</th>
                  <th className="px-5 py-3">Company / Branch</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Published</th>
                  <th className="px-5 py-3">Expire</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((j) => {
                  const expired = isExpired(j.expireAtUtc);

                  return (
                    <tr
                      key={j.jobPostingId}
                      className={cn("hover:bg-slate-50 cursor-pointer", activeJobId === j.jobPostingId && "bg-indigo-50/50")}
                      onClick={() => setActiveJobId(j.jobPostingId)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            {j.photoUrl ? (
                              <img src={j.photoUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full grid place-items-center text-xs font-bold text-slate-500">
                                JOB
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{s(j.jobRole)}</div>
                            <div className="text-xs text-slate-500">ID: {j.jobPostingId} • Apply: {s(j.applyEmail)}</div>
                            <div className="text-[11px] text-slate-400">Created: {fmtColombo(j.createdAtUtc)}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{s(j.companyName, "Unknown Company")}</div>
                        <div className="text-xs text-slate-500">{s(j.branchName, "—")}</div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusPill status={j.status} expired={expired} />
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">{fmtColombo(j.publishedAtUtc)}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{fmtColombo(j.expireAtUtc)}</td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveJobId(j.jobPostingId)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            type="button"
                          >
                            Open
                          </button>

                          <button
                            onClick={() => {
                              setEditingJob(j);
                              setOpenUpsert(true);
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            type="button"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => askDeleteJob(j)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      No job postings found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <JobUpsertModal
        open={openUpsert}
        job={editingJob}
        onClose={() => setOpenUpsert(false)}
        onSaved={async () => {
          setOpenUpsert(false);
          setEditingJob(null);
          await load();
        }}
      />

      {/* Details Drawer */}
      <JobDetailsDrawer
        open={!!activeJobId}
        job={activeJob}
        onClose={() => setActiveJobId(null)}
        onRefresh={load}
        onEdit={() => {
          if (!activeJob) return;
          setEditingJob(activeJob);
          setOpenUpsert(true);
        }}
        onUpdate={(payload) => (activeJobId ? doUpdateJob(activeJobId, payload) : Promise.resolve())}
        onUpdateWithPhoto={(payload, photo) =>
          activeJobId ? doUpdateJobPhoto(activeJobId, payload, photo) : Promise.resolve()
        }
        onDelete={() => {
          if (activeJob) askDeleteJob(activeJob);
        }}
      />

      {/* Confirm */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? null}
        confirmText="Delete"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return;
          await confirm.onConfirm();
        }}
      />
    </div>
  );
}
