import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { AxiosError } from "axios";

type ApiErrorBody = {
  message?: string;
  error?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState<string>("superadmin");
  const [password, setPassword] = useState<string>("SuperAdmin@123");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username.trim(), password);

      // ✅ Always navigate to single dashboard
      navigate("/super", { replace: true });

    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ApiErrorBody>;
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.response?.data?.error ||
        axiosErr?.message ||
        "Login failed. Check username/password.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Background accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* Left brand panel */}
          <div className="hidden lg:flex flex-col justify-between rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-700 p-10 text-white shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
                <span className="text-sm font-semibold tracking-wide">
                  NEXAS CRM
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-bold leading-tight">
                Smart CRM for tickets,
                <br />
                meetings & admin control
              </h1>

              <p className="mt-4 text-white/85 text-base leading-relaxed">
                Access your dashboard securely. Manage tickets, meetings,
                job postings, and system operations from one unified panel.
              </p>
            </div>

            <div className="text-sm text-white/75">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />
                Secure authentication
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-300" />
                Role-based permissions
              </div>
            </div>
          </div>

          {/* Right login card */}
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-blue-100 shadow-xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Sign in to Nexas
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Enter your CRM credentials to continue
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-sky-50 border border-sky-100 px-3 py-2">
                <div className="h-8 w-8 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold">
                  N
                </div>
                <div className="leading-tight">
                  <div className="text-xs text-slate-500">CRM Platform</div>
                  <div className="text-sm font-semibold text-slate-800">
                    Nexas
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter password"
                />
              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-sky-600 text-white py-2.5 font-semibold hover:bg-sky-500 focus:ring-4 focus:ring-sky-200 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Footer branding */}
            <div className="mt-6 text-center text-xs text-slate-500">
              Powered by{" "}
              <span className="font-semibold text-slate-700">
                VentureCorp
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
