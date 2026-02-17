import { api } from "./axios";
import type { Company } from "./company.api";
import type { Branch } from "./branch.api";

export type ContactPerson = {
  id: number;
  company: Pick<Company, "companyId" | "name" | "phoneNumber" | "email" | "timezoneString">;
  branch: Pick<Branch, "branchId" | "branchName" | "branchCode"> | null;
  name: string;
  position: string | null;
  email: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  createdAtUtc?: string;
  updatedAtUtc?: string;
};

export type ContactCreatePayload = {
  companyId: number;
  branchId?: number | null;
  name: string;
  position?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
};

export type ContactUpdatePayload = {
  branchId?: number | null;
  name: string;
  position?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  isActive: boolean;
};

export async function createContactPerson(payload: ContactCreatePayload) {
  const { data } = await api.post<ContactPerson>("/api/company-contact-persons", payload);
  return data;
}

export async function listContactPersons(params?: { companyId?: number; branchId?: number }) {
  const { data } = await api.get<ContactPerson[]>("/api/company-contact-persons", { params });
  return data;
}

export async function updateContactPerson(id: number, payload: ContactUpdatePayload) {
  const { data } = await api.put<ContactPerson>(`/api/company-contact-persons/${id}`, payload);
  return data;
}

export async function deleteContactPerson(id: number) {
  const { data } = await api.delete(`/api/company-contact-persons/${id}`);
  return data;
}
