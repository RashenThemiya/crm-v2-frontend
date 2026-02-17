import type { AuthData } from "./AuthContext";

const KEY = "lovebke_auth";

export function saveAuth(auth: AuthData) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function getAuth(): AuthData | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as AuthData) : null;
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function getAccessToken(): string | null {
  return getAuth()?.token ?? null;
}

export function getUserRole(): AuthData["adminType"] | null {
  return getAuth()?.adminType ?? null;
}
