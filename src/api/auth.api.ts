import { api } from "./axios";
import type { AuthData } from "../auth/AuthContext";

export async function loginApi(payload: { username: string; password: string }) {
  const { data } = await api.post<AuthData>("/api/auth/login", payload);
  return data;
}
