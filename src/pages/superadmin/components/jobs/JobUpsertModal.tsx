import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../../../utils/toast";
import {
  createJobPosting,
  createJobPostingMultipart,
  updateJobPosting,
  updateJobPostingMultipart,
  type JobStatus,
  type JobCategory,
  type CreateJobPostingDTO,
  type UpdateJobPostingDTO,
  type JobPosting,
} from "../../../../api/jobPosting.api";
import { listCompanies, type Company } from "../../../../api/company.api";
import { listBranches, type Branch } from "../../../../api/branch.api";

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

// "datetime-local" -> UTC ISO
function toUtcIso(localDateTime: string): string {
  const d = new Date(localDateTime);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid expire date/time");
  return d.toISOString();
}

// UTC ISO -> "yyyy-MM-ddTHH:mm" for <input type="datetime-local" />
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

export default function JobUpsertModal({
  open,
  job, // null for create, JobPosting for edit
  onClose,
  onSaved,
}: {
  open: boolean;
  job: JobPosting | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const isEdit = !!job;

  const [saving, setSaving] = useState(false);

  // lookups
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // fields
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);

  const [jobRole, setJobRole] = useState("");
  const [jobCategory, setJobCategory] = useState<JobCategory>("OTHER");
  const [applyEmail, setApplyEmail] = useState("");
  const [status, setStatus] = useState<JobStatus>("DRAFT");

  // ✅ use datetime-local and convert to UTC ISO when sending
  const [expireAtLocal, setExpireAtLocal] = useState("");

  const [reqText, setReqText] = useState("");
  const [expText, setExpText] = useState("");
  const [benText, setBenText] = useState("");

  // image: only NEW selected file
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const newPhotoPreview = useMemo(() => {
    if (!newPhoto) return null;
    return URL.createObjectURL(newPhoto);
  }, [newPhoto]);

  // load lookups once
  useEffect(() => {
    (async () => {
      try {
        const [c, b] = await Promise.all([listCompanies(), listBranches()]);
        setCompanies(c);
        setBranches(b);
      } catch {
        toast("Failed to load companies/branches", true);
      }
    })();
  }, []);

  // init when modal opens OR job changes
  useEffect(() => {
    if (!open) return;

    if (job) {
      setCompanyId(job.companyId ?? null);
      setBranchId(job.branchId ?? null);

      setJobRole(job.jobRole ?? "");
      setJobCategory((job.jobCategory as JobCategory) ?? "OTHER");
      setApplyEmail(job.applyEmail ?? "");
      setStatus(job.status ?? "DRAFT");

      // convert server utc -> local input
      setExpireAtLocal(toLocalInputValue(job.expireAtUtc));

      setReqText((job.requirement ?? []).join("\n"));
      setExpText((job.experience ?? []).join("\n"));
      setBenText((job.benefit ?? []).join("\n"));
    } else {
      setCompanyId(null);
      setBranchId(null);

      setJobRole("");
      setJobCategory("OTHER");
      setApplyEmail("");
      setStatus("DRAFT");
      setExpireAtLocal("");

      setReqText("");
      setExpText("");
      setBenText("");
    }

    setNewPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, job?.jobPostingId]);

  const filteredBranches = useMemo(() => {
    if (!companyId) return [];
    return branches.filter((b) => b.company.companyId === companyId);
  }, [branches, companyId]);

  // ✅ CREATE DTO (expireAtUtc must be STRING - not null)
  const createDto: CreateJobPostingDTO | null = useMemo(() => {
    if (!companyId) return null;

    // backend Create DTO had @NotNull expireAtUtc -> require it
    if (!expireAtLocal) return null;

    return {
      companyId,
      // branch optional in backend; in your UI you require selection
      branchId: branchId ?? undefined,
      ticketId: null,

      jobRole: jobRole.trim(),
      jobCategory,

      applyEmail: applyEmail.trim(),

      status,
      expireAtUtc: toUtcIso(expireAtLocal),

      requirement: reqText.split("\n").map((x) => x.trim()).filter(Boolean),
      experience: expText.split("\n").map((x) => x.trim()).filter(Boolean),
      benefit: benText.split("\n").map((x) => x.trim()).filter(Boolean),
    };
  }, [
    companyId,
    branchId,
    jobRole,
    jobCategory,
    applyEmail,
    status,
    expireAtLocal,
    reqText,
    expText,
    benText,
  ]);

  // ✅ UPDATE DTO (only changed fields)
  const updateDto: UpdateJobPostingDTO = useMemo(() => {
    const payload: UpdateJobPostingDTO = {
      jobRole: jobRole.trim(),
      jobCategory,
      applyEmail: applyEmail.trim(),
      status,
      requirement: reqText.split("\n").map((x) => x.trim()).filter(Boolean),
      experience: expText.split("\n").map((x) => x.trim()).filter(Boolean),
      benefit: benText.split("\n").map((x) => x.trim()).filter(Boolean),
    };

    // expire optional in update, send only if provided
    if (expireAtLocal) payload.expireAtUtc = toUtcIso(expireAtLocal);

    return payload;
  }, [jobRole, jobCategory, applyEmail, status, expireAtLocal, reqText, expText, benText]);

  function closeAndReset() {
    setNewPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }

  if (!open) return null;

  const currentImage = job?.photoUrl ?? null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={closeAndReset} />

      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-semibold text-slate-900">
            {isEdit ? "Edit Job Posting" : "Create Job Posting"}
          </div>

          <button
            onClick={closeAndReset}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          {/* IMAGE */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Image (Optional)</div>
                <div className="text-xs text-slate-600 mt-1">
                  {isEdit
                    ? "Current image is shown. Select a new image to replace it."
                    : "Upload a cover image for this job."}
                </div>
              </div>

              {newPhoto ? (
                <button
                  type="button"
                  onClick={() => {
                    setNewPhoto(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Remove new
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-56 h-28 rounded-xl bg-white border border-slate-200 overflow-hidden grid place-items-center">
                {newPhotoPreview ? (
                  <img src={newPhotoPreview} alt="" className="h-full w-full object-cover" />
                ) : currentImage ? (
                  <img src={currentImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-xs font-semibold text-slate-400">No image</div>
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
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
                      <span className="font-semibold">Selected:</span> {newPhoto.name}
                    </>
                  ) : (
                    <span className="text-slate-500">
                      Choose a file only if you want to upload/replace image.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <div className="text-xs font-semibold mb-1">Company</div>
            <select
              value={companyId ?? ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                setCompanyId(id || null);
                setBranchId(null);
              }}
              disabled={isEdit}
              className="w-full border rounded-xl px-3 py-2 text-sm disabled:bg-slate-100"
            >
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c.companyId} value={c.companyId}>
                  {c.name}
                </option>
              ))}
            </select>

            {isEdit ? (
              <div className="mt-1 text-xs text-slate-500">
                Company cannot be changed in edit.
              </div>
            ) : null}
          </div>

          {/* BRANCH */}
          <div>
            <div className="text-xs font-semibold mb-1">Branch</div>
            <select
              value={branchId ?? ""}
              onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : null)}
              disabled={!companyId || isEdit}
              className="w-full border rounded-xl px-3 py-2 text-sm disabled:bg-slate-100"
            >
              <option value="">Select branch</option>
              {filteredBranches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ CATEGORY */}
          <div>
            <div className="text-xs font-semibold mb-1">Job Category</div>
            <select
              value={jobCategory}
              onChange={(e) => setJobCategory(e.target.value as JobCategory)}
              className="w-full border rounded-xl px-3 py-2 text-sm"
            >
              {JOB_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Field label="Job Role" value={jobRole} onChange={setJobRole} />
          <Field label="Apply Email" value={applyEmail} onChange={setApplyEmail} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* ✅ datetime-local instead of typing ISO */}
            <div>
              <div className="text-xs font-semibold mb-1">Expire At (Local)</div>
              <input
                type="datetime-local"
                value={expireAtLocal}
                onChange={(e) => setExpireAtLocal(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-sm"
              />
              <div className="mt-1 text-[11px] text-slate-500">
                We convert to UTC automatically when saving.
              </div>
            </div>
          </div>

          <TextArea label="Requirements (one per line)" value={reqText} onChange={setReqText} />
          <TextArea label="Experience (one per line)" value={expText} onChange={setExpText} />
          <TextArea label="Benefits (one per line)" value={benText} onChange={setBenText} />
        </div>

        <div className="px-5 py-4 border-t flex justify-end gap-2">
          <button
            onClick={closeAndReset}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={async () => {
              // validation
              if (!companyId) return toast("Select company", true);
              if (!branchId) return toast("Select branch", true);
              if (!jobRole.trim()) return toast("Job role required", true);
              if (!applyEmail.trim()) return toast("Apply email required", true);

              // backend create has @NotNull expireAtUtc
              if (!isEdit && !expireAtLocal) return toast("Expire date/time required", true);

              try {
                setSaving(true);

                if (!isEdit) {
                  if (!createDto) {
                    toast("Fill required fields (expire date/time)", true);
                    return;
                  }

                  if (newPhoto) await createJobPostingMultipart(createDto, newPhoto);
                  else await createJobPosting(createDto);
                } else {
                  const id = job!.jobPostingId;
                  if (newPhoto) await updateJobPostingMultipart(id, updateDto, newPhoto);
                  else await updateJobPosting(id, updateDto);
                }

                toast(isEdit ? "Job updated ✅" : "Job created ✅");
                await onSaved();
                closeAndReset();
              } catch (e: any) {
                toast(e?.response?.data?.message || e?.message || "Save failed", true);
              } finally {
                setSaving(false);
              }
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl disabled:opacity-60"
            type="button"
          >
            {saving
              ? "Saving..."
              : isEdit
              ? newPhoto
                ? "Save + Replace Image"
                : "Save"
              : newPhoto
              ? "Create + Upload"
              : "Create"}
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
      <div className="text-xs font-semibold mb-1">{label}</div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 text-sm"
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
      <div className="text-xs font-semibold mb-1">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full border rounded-xl px-3 py-2 text-sm"
      />
    </div>
  );
}
