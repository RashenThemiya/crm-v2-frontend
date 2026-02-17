import React, { useEffect, useState } from "react";
import { createAdmin, getAdmins, type Admin } from "../../api/admins.api";

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadAdmins() {
    try {
      setLoading(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createAdmin({
        name,
        contactNumber,
        username,
        password,
        type: "ADMIN",
      });

      // reset
      setName("");
      setContactNumber("");
      setUsername("");
      setPassword("");
      setShowForm(false);

      await loadAdmins();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-sm text-slate-600">
            Create and manage system administrators
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + Add Admin
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Admin Table */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 text-slate-500">Loading admins...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.adminId} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {a.name}
                  </td>
                  <td className="px-4 py-3">{a.username}</td>
                  <td className="px-4 py-3">{a.contactNumber ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                      {a.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "rounded-full px-2 py-1 text-xs font-semibold",
                        a.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700",
                      ].join(" ")}
                    >
                      {a.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Admin Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <form
            onSubmit={handleCreateAdmin}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Create Admin
            </h2>

            <div className="mt-4 space-y-3">
              <input
                placeholder="Full name"
                className="w-full rounded-lg border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                placeholder="Contact number"
                className="w-full rounded-lg border px-3 py-2"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
              <input
                placeholder="Username"
                className="w-full rounded-lg border px-3 py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                placeholder="Password"
                type="password"
                className="w-full rounded-lg border px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
