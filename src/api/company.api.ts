import { api } from "./axios";

export type Company = {
  companyId: number;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  note: string | null;
  timezoneString: string | null;
  createdAtUtc?: string;
  updatedAtUtc?: string;
};

export type CompanyUpsertPayload = {
  name: string;
  phoneNumber?: string | null;
  email?: string | null;
  note?: string | null;
  timezoneString?: string | null;
};

export async function createCompany(payload: CompanyUpsertPayload) {
  const { data } = await api.post<Company>("/api/companies", payload);
  return data;
}

export async function listCompanies() {
  const { data } = await api.get<Company[]>("/api/companies");
  return data;
}

export async function getCompany(companyId: number) {
  const { data } = await api.get<Company>(`/api/companies/${companyId}`);
  return data;
}

export async function updateCompany(companyId: number, payload: CompanyUpsertPayload) {
  const { data } = await api.put<Company>(`/api/companies/${companyId}`, payload);
  return data;
}

export async function deleteCompany(companyId: number) {
  const { data } = await api.delete(`/api/companies/${companyId}`);
  return data;
}
