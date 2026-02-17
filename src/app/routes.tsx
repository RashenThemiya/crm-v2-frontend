import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import ProtectedRoute from "../auth/ProtectedRoute";

// Public pages
import ContactPage from "../pages/public/ContactPage";
import HomePage from "../pages/public/HomePage";
import JobsPage from "../pages/public/JobsPage";

// Layout
import SuperAdminLayout from "../components/layout/SuperAdminLayout";

// Shared (ADMIN + SUPERADMIN) pages
import SuperAdminDashboardPage from "../pages/superadmin/SuperAdminDashboardPage";
import TicketDashboardPage from "../pages/superadmin/TicketDashboardPage";
import SuperAdminCalendarDashboardPage from "../pages/superadmin/SuperAdminCalendarDashboardPage";
import SuperAdminJobDashboardPage from "../pages/superadmin/SuperAdminJobDashboardPage";

// SUPERADMIN-only pages
import CompanyListPage from "../pages/superadmin/CompanyListPage";
import CompanyProfilePage from "../pages/superadmin/CompanyProfilePage";
import BranchProfilePage from "../pages/superadmin/BranchProfilePage";
import AdminManagementPage from "../pages/superadmin/AdminManagementPage";
import SettingsTicketFlowPage from "../pages/superadmin/SettingsPage";

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-xl font-semibold text-red-600">Unauthorized Access</h1>
    </div>
  );
}

export const router = createBrowserRouter([
  // -------------------------
  // Public
  // -------------------------
  { path: "/login", element: <Login /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/home", element: <HomePage /> },
  { path: "/jobs", element: <JobsPage /> },

  // -------------------------
  // Protected Area (ADMIN + SUPERADMIN)
  // ✅ Single base: /super
  // -------------------------
  {
    element: <ProtectedRoute allowRoles={["ADMIN", "SUPERADMIN"]} />,
    children: [
      {
        element: <SuperAdminLayout />,
        children: [
          // ✅ shared for both roles
          { path: "/super", element: <SuperAdminDashboardPage /> },
          { path: "/super/tickets", element: <TicketDashboardPage /> },
          { path: "/super/calendar", element: <SuperAdminCalendarDashboardPage /> },
          { path: "/super/jobs", element: <SuperAdminJobDashboardPage /> },

          // ✅ SUPERADMIN-only (wrap with another ProtectedRoute)
          {
            element: <ProtectedRoute allowRoles={["SUPERADMIN"]} />,
            children: [
              { path: "/super/company", element: <CompanyListPage /> },
              { path: "/super/company/:companyId", element: <CompanyProfilePage /> },
              { path: "/super/company/:companyId/:branchId", element: <BranchProfilePage /> },
              { path: "/super/admins", element: <AdminManagementPage /> },
              { path: "/super/settings", element: <SettingsTicketFlowPage /> },
            ],
          },
        ],
      },
    ],
  },

  // -------------------------
  // Common
  // -------------------------
  { path: "/unauthorized", element: <Unauthorized /> },

  // Default
  { path: "/", element: <Navigate to="/home" replace /> },
  { path: "*", element: <Navigate to="/home" replace /> },
]);
