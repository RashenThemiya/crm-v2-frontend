// src/components/layout/SuperAdminLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";

export default function SuperAdminLayout() {
  return (
    // ✅ Make the whole app fixed height and prevent body scroll
    <div className="h-screen bg-slate-100 md:flex overflow-hidden">
      {/* ✅ Sidebar stays fixed (desktop), mobile topbar is inside sidebar component */}
      <SuperAdminSidebar />

      {/* ✅ Only this main area scrolls */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile: reserve space for sticky topbar (h-14) */}
        <div className="md:hidden h-14" />

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
