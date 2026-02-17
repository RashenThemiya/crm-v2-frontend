import React, { createContext, useContext, useMemo, useState } from "react";
import { clearAuth, getAuth, saveAuth } from "./auth.storage";
import { loginApi } from "../api/auth.api";

export type AdminType = "SUPERADMIN" | "ADMIN";

export type AuthData = {
  token: string;
  tokenType: "Bearer" | string;
  expiresInMs: number;
  adminId: number;
  username: string;
  adminType: AdminType;
};

type AuthContextValue = {
  auth: AuthData | null;
  role: AdminType | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<AuthData>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthData | null>(() => getAuth());

  const isLoggedIn = !!auth?.token;
  const role: AdminType | null = auth?.adminType ?? null;

  async function login(username: string, password: string): Promise<AuthData> {
    const res = await loginApi({ username, password }); // must return AuthData
    saveAuth(res);
    setAuth(res);
    return res;
  }

  function logout() {
    clearAuth();
    setAuth(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({ auth, role, isLoggedIn, login, logout }),
    [auth, role, isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
