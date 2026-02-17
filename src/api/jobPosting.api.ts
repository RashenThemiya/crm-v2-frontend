// src/api/jobPosting.api.ts
import { api } from "./axios";

export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type JobCategory =
  | "IT"
  | "HR"
  | "FINANCE"
  | "MARKETING"
  | "SALES"
  | "ENGINEERING"
  | "OPERATIONS"
  | "OTHER";

export type JobPosting = {
  jobPostingId: number;

  companyId: number;
  companyName: string;

  branchId: number | null;
  branchName: string | null;

  ticketId: number | null;

  jobRole: string;

  // ✅ NEW
  jobCategory: JobCategory | null;

  requirement: string[];
  experience: string[];
  benefit: string[];

  applyEmail: string | null;
  photoUrl: string | null;

  status: JobStatus;

  publishedAtUtc: string | null;
  expireAtUtc: string | null;
  closedAtUtc: string | null;

  createdByAdminId: number;
  createdByUsername: string;

  updatedByAdminId: number | null;
  updatedByUsername: string | null;

  createdAtUtc: string;
  updatedAtUtc: string;
};

export type JobPostingListParams = {
  companyId?: number;
  status?: JobStatus;
  // ✅ NEW
  jobCategory?: JobCategory;
};

export async function listJobPostings(params?: JobPostingListParams) {
  const { data } = await api.get<JobPosting[]>("/api/job-postings", { params });
  return data;
}

export async function getJobPosting(jobPostingId: number) {
  const { data } = await api.get<JobPosting>(`/api/job-postings/${jobPostingId}`);
  return data;
}

/** =========================
 * CREATE (JSON)
 * POST /api/job-postings
 * ========================= */
export type CreateJobPostingDTO = {
  companyId: number;
  branchId?: number | null; // ✅ allow null/optional
  ticketId?: number | null;

  jobRole: string;

  // ✅ NEW (optional -> backend defaults to OTHER)
  jobCategory?: JobCategory | null;

  requirement: string[];
  experience: string[];
  benefit: string[];

  applyEmail?: string | null;

  status: JobStatus;

  expireAtUtc: string; // ✅ backend has @NotNull so keep required
};

export async function createJobPosting(dto: CreateJobPostingDTO) {
  const { data } = await api.post<JobPosting>("/api/job-postings", dto);
  return data;
}

/** =========================
 * CREATE (multipart with photo)
 * POST /api/job-postings/multipart
 * form-data:
 *  - data: JSON string (application/json)
 *  - photo: file
 * ========================= */
export async function createJobPostingMultipart(dto: CreateJobPostingDTO, photo: File) {
  const form = new FormData();
  form.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
  form.append("photo", photo);

  const { data } = await api.post<JobPosting>("/api/job-postings/multipart", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** =========================
 * UPDATE (JSON)
 * PUT /api/job-postings/{id}
 * ========================= */
export type UpdateJobPostingDTO = Partial<{
  branchId: number | null;
  ticketId: number | null;

  jobRole: string;

  // ✅ NEW
  jobCategory: JobCategory | null;

  requirement: string[];
  experience: string[];
  benefit: string[];

  applyEmail: string | null;

  status: JobStatus;

  expireAtUtc: string; // ISO UTC
}>;

export async function updateJobPosting(jobPostingId: number, dto: UpdateJobPostingDTO) {
  const { data } = await api.put<JobPosting>(`/api/job-postings/${jobPostingId}`, dto);
  return data;
}

/** =========================
 * UPDATE (multipart with photo)
 * PUT /api/job-postings/{id}/multipart
 * form-data:
 *  - data: JSON string
 *  - photo: optional file
 * ========================= */
export async function updateJobPostingMultipart(
  jobPostingId: number,
  dto: UpdateJobPostingDTO,
  photo?: File
) {
  const form = new FormData();
  form.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));
  if (photo) form.append("photo", photo);

  const { data } = await api.put<JobPosting>(`/api/job-postings/${jobPostingId}/multipart`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteJobPosting(jobPostingId: number) {
  await api.delete(`/api/job-postings/${jobPostingId}`);
}
