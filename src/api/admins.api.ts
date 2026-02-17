import { api } from "./axios";

export type Admin = {
  adminId: number;
  name: string;
  contactNumber: string | null;
  username: string;
  type: "ADMIN" | "SUPERADMIN";
  isActive: boolean;
};

export type CreateAdminPayload = {
  name: string;
  contactNumber?: string;
  username: string;
  password: string;
  type: "ADMIN";
};

// SUPER ADMIN – create admin
export async function createAdmin(payload: CreateAdminPayload): Promise<Admin> {
  const { data } = await api.post<Admin>("/api/admins", payload);
  return data;
}

// SUPER ADMIN – list admins
export async function getAdmins(): Promise<Admin[]> {
  const { data } = await api.get<Admin[]>("/api/admins");
  return data;
}
