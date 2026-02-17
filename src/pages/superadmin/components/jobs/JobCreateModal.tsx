import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../../../utils/toast";
import {
  createJobPosting,
  createJobPostingMultipart,
  type JobStatus,
  type CreateJobPostingDTO,
  type JobCategory,
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

// Converts "2026-04-30T10:30" (datetime-local, local tz) -> "2026-04-30T04:00:00.000Z" (UTC ISO)
function toUtcIso(localDateTime: string): string {
  const d = new Date(localDateTime);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date/time");
  return d.toISOString();
}

export default function JobCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}) {
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

  // expire date (local input)
  const [expireAtLocal, setExpireAtLocal] = useState("");

  const [reqText, setReqText] = useState("");
  const [expText, setExpText] = useState("");
  const [benText, setBenText] = useState("");

  // image
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const photoPreview = useMemo(() => {
    if (!photo) return null;
    return URL.createObjectURL(photo);
  }, [photo]);

  // load companies + branches
  useEffect(() => {
    async function loadLookups() {
      try {
        const [c, b] = await Promise.all([listCompanies(), listBranches()]);
        setCompanies(c);
        setBranches(b);
      } catch {
        toast("Failed to load companies/branches", true);
      }
    }
    loadLookups();
  }, []);

  const filteredBranches = useMemo(() => {
    if (!companyId) return [];
    return branches.filter((b) => b.company.companyId === companyId);
  }, [branches, companyId]);

  // ✅ build dto only when required fields exist (prevents TS errors)
  const dto: CreateJobPostingDTO | null = useMemo(() => {
    if (!companyId) return null;
    if (!jobRole.trim()) return null;
    if (!expireAtLocal) return null; // backend requires @NotNull

    return {
      companyId,
      branchId: branchId ?? null,
      ticketId: null,

      jobRole: jobRole.trim(),
      jobCategory,

      applyEmail: applyEmail.trim() || null,

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

  function reset() {
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
    setPhoto(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => {
          reset();
          onClose();
        }}
      />

      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex justify-between">
          <div className="font-semibold text-slate-900">Create Job Posting</div>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="text-sm"
            type="button"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          {/* IMAGE */}
          <div>
            <div className="text-sm font-semibold mb-2">Image (Optional)</div>

            {photoPreview && (
              <div className="mb-3">
                <img src={photoPreview} className="h-28 rounded-xl object-cover" />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setPhoto(f);
              }}
            />

            {photo && (
              <button
                type="button"
                onClick={() => {
                  setPhoto(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-2 text-xs text-red-600"
              >
                Remove Image
              </button>
            )}
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
              className="w-full border rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c.companyId} value={c.companyId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* BRANCH */}
          <div>
            <div className="text-xs font-semibold mb-1">Branch (Optional)</div>
            <select
              value={branchId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setBranchId(v ? Number(v) : null);
              }}
              disabled={!companyId}
              className="w-full border rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Select branch</option>
              {filteredBranches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
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
          <Field label="Apply Email (Optional)" value={applyEmail} onChange={setApplyEmail} />

          {/* STATUS (optional UI) */}
          <div>
            <div className="text-xs font-semibold mb-1">Status</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full border rounded-xl px-3 py-2 text-sm"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Expire at */}
          <div>
            <div className="text-xs font-semibold mb-1">Expire At (Local Time)</div>
            <input
              type="datetime-local"
              value={expireAtLocal}
              onChange={(e) => setExpireAtLocal(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
            <div className="text-[11px] text-slate-500 mt-1">
              Sent to backend as UTC ISO (Instant).
            </div>
          </div>

          <TextArea label="Requirements (one per line)" value={reqText} onChange={setReqText} />
          <TextArea label="Experience (one per line)" value={expText} onChange={setExpText} />
          <TextArea label="Benefits (one per line)" value={benText} onChange={setBenText} />
        </div>

        <div className="px-5 py-4 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              if (!companyId) return toast("Select company", true);
              if (!jobRole.trim()) return toast("Job role required", true);
              if (!expireAtLocal) return toast("Expire date/time required", true);

              if (!dto) return toast("Fill required fields", true);

              try {
                setSaving(true);

                if (photo) {
                  await createJobPostingMultipart(dto, photo);
                } else {
                  await createJobPosting(dto);
                }

                await onCreated();
                reset();
                onClose();
              } catch (e: any) {
                toast(e?.message || "Create failed", true);
              } finally {
                setSaving(false);
              }
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
          >
            {saving ? "Creating..." : "Create"}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-semibold mb-1">{label}</div>
      <input
        value={value}
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
