import { api } from "./axios";
import type { Company } from "./company.api";

export type Branch = {
  branchId: number;
  company: Pick<Company, "companyId" | "name" | "phoneNumber" | "email" | "timezoneString">;
  branchName: string;
  branchCode: string;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  timezoneString: string | null;
  effectiveTimezone?: string | null;
  createdAtUtc?: string;
  updatedAtUtc?: string;
};

export type BranchCreatePayload = {
  companyId: number;
  branchName: string;
  branchCode: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  timezoneString?: string | null;
};

export type BranchUpdatePayload = {
  branchName: string;
  branchCode: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  timezoneString?: string | null;
};

export async function createBranch(payload: BranchCreatePayload) {
  const { data } = await api.post<Branch>("/api/branches", payload);
  return data;
}

export async function listBranches() {
  const { data } = await api.get<Branch[]>("/api/branches");
  return data;
}

export async function getBranch(branchId: number) {
  const { data } = await api.get<Branch>(`/api/branches/${branchId}`);
  return data;
}

export async function updateBranch(branchId: number, payload: BranchUpdatePayload) {
  const { data } = await api.put<Branch>(`/api/branches/${branchId}`, payload);
  return data;
}

export async function deleteBranch(branchId: number) {
  const { data } = await api.delete(`/api/branches/${branchId}`);
  return data;
}
