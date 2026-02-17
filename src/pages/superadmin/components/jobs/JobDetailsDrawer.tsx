import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../../../utils/toast";
import type { JobPosting, JobStatus, UpdateJobPostingDTO } from "../../../../api/jobPosting.api";

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

// ✅ "datetime-local" -> UTC ISO string
function toUtcIso(localDateTime: string): string {
  const d = new Date(localDateTime);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid expire date/time");
  return d.toISOString();
}

// ✅ UTC ISO -> value for <input type="datetime-local" />
function toLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function JobDetailsDrawer({
  open,
  job,
  onClose,
  onRefresh,
  onEdit,
  onUpdate,
  onUpdateWithPhoto,
  onDelete,
}: {
  open: boolean;
  job: JobPosting | null;

  onClose: () => void;
  onRefresh: () => void | Promise<void>;

  onEdit?: () => void;
  onUpdate: (payload: UpdateJobPostingDTO) => Promise<void>;
  onUpdateWithPhoto?: (payload: UpdateJobPostingDTO, photo: File) => Promise<void>;

  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // edit fields (local)
  const [jobRole, setJobRole] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [status, setStatus] = useState<JobStatus>("DRAFT");

  // ✅ use datetime-local in UI
  const [expireAtLocal, setExpireAtLocal] = useState("");

  const [reqText, setReqText] = useState("");
  const [expText, setExpText] = useState("");
  const [benText, setBenText] = useState("");

  // image
  const [photo, setPhoto] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);

  useEffect(() => {
    if (!open || !job) return;

    setEditing(false);
    setSaving(false);

    setJobRole(job.jobRole ?? "");
    setApplyEmail(job.applyEmail ?? "");
    setStatus(job.status ?? "DRAFT");

    // ✅ convert server utc -> local input
    setExpireAtLocal(toLocalInputValue(job.expireAtUtc));

    setReqText((job.requirement ?? []).join("\n"));
    setExpText((job.experience ?? []).join("\n"));
    setBenText((job.benefit ?? []).join("\n"));

    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }, [open, job?.jobPostingId]);

  // ✅ Update DTO: expireAtUtc is OPTIONAL (send only if user sets it)
  const dto: UpdateJobPostingDTO = useMemo(() => {
    const payload: UpdateJobPostingDTO = {
      jobRole: jobRole.trim(),
      applyEmail: applyEmail.trim(),
      status,
      requirement: reqText.split("\n").map((x) => x.trim()).filter(Boolean),
      experience: expText.split("\n").map((x) => x.trim()).filter(Boolean),
      benefit: benText.split("\n").map((x) => x.trim()).filter(Boolean),
    };

    if (expireAtLocal) payload.expireAtUtc = toUtcIso(expireAtLocal);

    return payload;
  }, [jobRole, applyEmail, status, expireAtLocal, reqText, expText, benText]);

  if (!open) return null;

  const expired = isExpired(job?.expireAtUtc);

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-[95vw] max-w-xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-slate-500">Job Posting</div>
            <div className="text-lg font-bold text-slate-900 truncate">
              {job ? `#${job.jobPostingId} • ${job.jobRole}` : "—"}
            </div>
            {job ? (
              <div className="mt-1 flex items-center gap-2">
                <StatusPill status={job.status} expired={expired} />
                <span className="text-xs text-slate-500">
                  {job.companyName} • {job.branchName}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={async () => {
                try {
                  await onRefresh();
                  toast("Refreshed ✅");
                } catch {
                  toast("Refresh failed", true);
                }
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              type="button"
            >
              Refresh
            </button>

            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              type="button"
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {!job ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">No job selected.</div>
          ) : (
            <>
              {/* Image */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Photo</div>
                    <div className="text-xs text-slate-600 mt-1">Current image + replace (edit mode)</div>
                  </div>

                  {editing && photo ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Remove new
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-white h-28">
                    {photoPreview ? (
                      <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                    ) : job.photoUrl ? (
                      <img src={job.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-xs font-semibold text-slate-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-slate-600">{editing ? "Choose a new image to replace" : "Enable edit to change image"}</div>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={!editing}
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        if (!f) return;

                        const ok = ["image/png", "image/jpeg", "image/webp"].includes(f.type);
                        if (!ok) {
                          toast("Only PNG/JPG/WebP allowed", true);
                          e.target.value = "";
                          return;
                        }
                        if (f.size > 5 * 1024 * 1024) {
                          toast("Max image size 5MB", true);
                          e.target.value = "";
                          return;
                        }

                        setPhoto(f);
                      }}
                      className="block w-full text-xs"
                    />

                    {photo ? (
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold">New:</span> {photo.name}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Job Role" value={jobRole} onChange={setJobRole} disabled={!editing} />
                <Field label="Apply Email" value={applyEmail} onChange={setApplyEmail} disabled={!editing} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Status</div>
                  <select
                    value={status}
                    disabled={!editing}
                    onChange={(e) => setStatus(e.target.value as JobStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white disabled:bg-slate-100"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {/* ✅ local datetime input */}
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Expire At (Local)</div>
                  <input
                    type="datetime-local"
                    value={expireAtLocal}
                    disabled={!editing}
                    onChange={(e) => setExpireAtLocal(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white disabled:bg-slate-100"
                  />
                  <div className="mt-1 text-[11px] text-slate-500">Saved as UTC on backend.</div>
                </div>
              </div>

              <TextArea label="Requirements (one per line)" value={reqText} onChange={setReqText} disabled={!editing} />
              <TextArea label="Experience (one per line)" value={expText} onChange={setExpText} disabled={!editing} />
              <TextArea label="Benefits (one per line)" value={benText} onChange={setBenText} disabled={!editing} />

              {/* Readonly info */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="text-xs text-slate-500">Meta</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700">
                  <div>
                    <div className="text-xs text-slate-500">Published</div>
                    <div className="font-semibold">{fmtColombo(job.publishedAtUtc)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Closed</div>
                    <div className="font-semibold">{fmtColombo(job.closedAtUtc)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Created</div>
                    <div className="font-semibold">{fmtColombo(job.createdAtUtc)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Updated</div>
                    <div className="font-semibold">{fmtColombo(job.updatedAtUtc)}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 flex items-center justify-between gap-2">
          <button
            onClick={() => onDelete()}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            type="button"
            disabled={!job}
          >
            Delete
          </button>

          <div className="flex items-center gap-2">
            {onEdit ? (
              <button
                onClick={onEdit}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                type="button"
                disabled={!job}
              >
                Open Edit Modal
              </button>
            ) : null}

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                type="button"
                disabled={!job}
              >
                Edit Here
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (!job) return;
                    setEditing(false);
                    setSaving(false);

                    setJobRole(job.jobRole ?? "");
                    setApplyEmail(job.applyEmail ?? "");
                    setStatus(job.status ?? "DRAFT");
                    setExpireAtLocal(toLocalInputValue(job.expireAtUtc));

                    setReqText((job.requirement ?? []).join("\n"));
                    setExpText((job.experience ?? []).join("\n"));
                    setBenText((job.benefit ?? []).join("\n"));

                    setPhoto(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  type="button"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (!job) return;
                    if (!dto.jobRole) return toast("Job role required", true);
                    if (!dto.applyEmail) return toast("Apply email required", true);

                    try {
                      setSaving(true);
                      if (photo) {
                        if (!onUpdateWithPhoto) {
                          toast("Multipart update is not wired", true);
                          return;
                        }
                        await onUpdateWithPhoto(dto, photo);
                      } else {
                        await onUpdate(dto);
                      }

                      setEditing(false);
                      setPhoto(null);
                      if (fileRef.current) fileRef.current.value = "";
                    } catch (e: any) {
                      toast(e?.response?.data?.message || e?.message || "Save failed", true);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  type="button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-600 mb-1">{label}</div>
      <input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white disabled:bg-slate-100"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-600 mb-1">{label}</div>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white disabled:bg-slate-100"
      />
    </div>
  );
}
