import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type AdminType } from "./AuthContext";

type ProtectedRouteProps = {
  allowRoles?: AdminType[];
};

export default function ProtectedRoute({
  allowRoles,
}: ProtectedRouteProps) {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles && allowRoles.length > 0 && !role) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowRoles && role && !allowRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
