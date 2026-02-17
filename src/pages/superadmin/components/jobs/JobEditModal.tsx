/* =========================================================
   ✅ JOB EDIT MODAL (UPDATED with jobCategory + datetime-local)
   File: JobEditModal.tsx
========================================================= */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../../../utils/toast";
import {
  type JobPosting,
  type JobStatus,
  type JobCategory,
  type UpdateJobPostingDTO,
  updateJobPosting,
  updateJobPostingMultipart,
} from "../../../../api/jobPosting.api";

const JOB_CATEGORIES: JobCategory[] = [
  "IT",
  "HR",
  "FINANCE",
  "MARKETING",
  "SALES",
  "ENGINEERING",
  "OPERATIONS",
  "OTHER",
];

function toUtcIso(localDateTime: string): string {
  const d = new Date(localDateTime);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date/time");
  return d.toISOString();
}

function utcIsoToLocalInput(utcIso?: string | null): string {
  if (!utcIso) return "";
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function JobEditModal({
  open,
  job,
  onClose,
  onUpdated,
}: {
  open: boolean;
  job: JobPosting | null;
  onClose: () => void;
  onUpdated: () => Promise<void> | void;
}) {
  const [saving, setSaving] = useState(false);

  // form fields
  const [jobRole, setJobRole] = useState("");
  const [jobCategory, setJobCategory] = useState<JobCategory>("OTHER");
  const [applyEmail, setApplyEmail] = useState("");
  const [status, setStatus] = useState<JobStatus>("DRAFT");

  // expire local input
  const [expireAtLocal, setExpireAtLocal] = useState("");

  const [reqText, setReqText] = useState("");
  const [expText, setExpText] = useState("");
  const [benText, setBenText] = useState("");

  // image
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const newPhotoPreview = useMemo(() => {
    if (!newPhoto) return null;
    return URL.createObjectURL(newPhoto);
  }, [newPhoto]);

  // init form when opening / job changes
  useEffect(() => {
    if (!open || !job) return;

    setJobRole(job.jobRole ?? "");
    setJobCategory((job.jobCategory ?? "OTHER") as JobCategory);
    setApplyEmail(job.applyEmail ?? "");
    setStatus(job.status ?? "DRAFT");
    setExpireAtLocal(utcIsoToLocalInput(job.expireAtUtc ?? ""));

    setReqText((job.requirement ?? []).join("\n"));
    setExpText((job.experience ?? []).join("\n"));
    setBenText((job.benefit ?? []).join("\n"));

    setNewPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }, [open, job?.jobPostingId]);

  const dto: UpdateJobPostingDTO = useMemo(() => {
    // expireAtUtc optional in update: send only if user filled
    const expireAtUtc = expireAtLocal ? toUtcIso(expireAtLocal) : undefined;

    return {
      jobRole: jobRole.trim(),
      jobCategory, // ✅ NEW
      applyEmail: applyEmail.trim(),
      status,
      expireAtUtc,
      requirement: reqText.split("\n").map((x) => x.trim()).filter(Boolean),
      experience: expText.split("\n").map((x) => x.trim()).filter(Boolean),
      benefit: benText.split("\n").map((x) => x.trim()).filter(Boolean),
    };
  }, [jobRole, jobCategory, applyEmail, status, expireAtLocal, reqText, expText, benText]);

  if (!open || !job) return null;

  const currentPreview = job.photoUrl;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-semibold text-slate-900">Edit Job Posting</div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          {/* ✅ Image section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Job Image</div>
                <div className="text-xs text-slate-600 mt-1">Current image shown. Select a new image to replace.</div>
              </div>

              {newPhoto ? (
                <button
                  type="button"
                  onClick={() => {
                    setNewPhoto(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Remove new
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              {/* preview */}
              <div className="w-full sm:w-56 h-28 rounded-xl bg-white border border-slate-200 overflow-hidden grid place-items-center">
                {newPhotoPreview ? (
                  <img src={newPhotoPreview} alt="" className="h-full w-full object-cover" />
                ) : currentPreview ? (
                  <img src={currentPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-xs font-bold text-slate-400">No image</div>
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (!f) return;

                    const okTypes = ["image/png", "image/jpeg", "image/webp"];
                    if (!okTypes.includes(f.type)) {
                      toast("Only PNG/JPG/WebP allowed", true);
                      e.target.value = "";
                      return;
                    }
                    if (f.size > 5 * 1024 * 1024) {
                      toast("Max image size is 5MB", true);
                      e.target.value = "";
                      return;
                    }

                    setNewPhoto(f);
                  }}
                  className="block w-full text-sm"
                />

                <div className="mt-2 text-xs text-slate-600">
                  {newPhoto ? (
                    <>
                      <span className="font-semibold">New image:</span> {newPhoto.name}
                    </>
                  ) : (
                    <span className="text-slate-500">Select a new image only if you want to change it.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Job Role" value={jobRole} onChange={setJobRole} />
            <Field label="Apply Email" value={applyEmail} onChange={setApplyEmail} />
          </div>

          {/* ✅ category + status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Job Category</div>
              <select
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value as JobCategory)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Status</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {/* ✅ expire local */}
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-1">Expire At (Local Time)</div>
            <input
              type="datetime-local"
              value={expireAtLocal}
              onChange={(e) => setExpireAtLocal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="text-[11px] text-slate-500 mt-1">Converted to UTC before sending to backend.</div>
          </div>

          <TextArea label="Requirements (one per line)" value={reqText} onChange={setReqText} />
          <TextArea label="Experience (one per line)" value={expText} onChange={setExpText} />
          <TextArea label="Benefits (one per line)" value={benText} onChange={setBenText} />
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              if (!dto.jobRole) return toast("Job Role is required", true);
              if (!dto.applyEmail) return toast("Apply Email is required", true);

              try {
                setSaving(true);

                if (newPhoto) {
                  await updateJobPostingMultipart(job.jobPostingId, dto, newPhoto);
                } else {
                  await updateJobPosting(job.jobPostingId, dto);
                }

                toast("Job updated ✅");
                await onUpdated();
                onClose();
              } catch (e: any) {
                toast(e?.response?.data?.message || e?.message || "Update failed", true);
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            type="button"
            disabled={saving}
          >
            {saving ? "Saving..." : newPhoto ? "Save + Replace Image" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-600 mb-1">{label}</div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-600 mb-1">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  );
}
