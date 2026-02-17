import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

type MenuItem = {
  label: string;
  path: string;
  roles?: Array<"ADMIN" | "SUPERADMIN">; // ✅ allowed roles
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/super", roles: ["ADMIN", "SUPERADMIN"] },

  // ✅ SUPERADMIN only
  { label: "Company", path: "/super/company", roles: ["SUPERADMIN"] },
  { label: "Admin Management", path: "/super/admins", roles: ["SUPERADMIN"] },
  { label: "Settings", path: "/super/settings", roles: ["SUPERADMIN"] },

  // ✅ Shared (ADMIN + SUPERADMIN)
  { label: "Ticket", path: "/super/tickets", roles: ["ADMIN", "SUPERADMIN"] },
  { label: "Meeting Calendar", path: "/super/calendar", roles: ["ADMIN", "SUPERADMIN"] },

  // ✅ You can decide: keep for ADMIN or not
  { label: "Jobs", path: "/super/jobs", roles: ["SUPERADMIN"] }, // change to ["ADMIN","SUPERADMIN"] if admin should see
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SuperAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (auth?.adminType ?? "ADMIN") as "ADMIN" | "SUPERADMIN";

  // ✅ visible menu based on role
  const visibleMenu = useMemo(() => {
    return menuItems.filter((m) => !m.roles || m.roles.includes(role));
  }, [role]);

  // Close drawer on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer open (mobile)
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = useMemo(
    () => auth?.username?.slice(0, 2).toUpperCase() ?? "SA",
    [auth?.username]
  );

  // --- Shared UI blocks ---
  const Brand = (
    <div className="px-6 py-5 border-b border-white/20">
      <h1 className="text-xl font-bold tracking-wide">NEXAS</h1>
      <p className="text-xs text-white/70">Powered by VentureCorp</p>
    </div>
  );

  const Menu = (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {visibleMenu.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          className={({ isActive }) =>
            cn(
              "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-white/20 text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const ProfileCard = (
    <div className="m-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 p-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-sky-300 flex items-center justify-center font-bold text-indigo-900">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">
            {auth?.username ?? "Admin"}
          </div>
          <div className="text-xs text-white/70">{role}</div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="rounded-lg p-2 hover:bg-white/10 transition"
        >
          ⎋
        </button>
      </div>
    </div>
  );

  const Footer = (
    <div className="px-6 py-2 text-xs text-white/50 text-center">
      © {new Date().getFullYear()} Nexas CRM
    </div>
  );

  return (
    <>
      {/* ================= MOBILE TOP BAR (visible < md) ================= */}
      <header className="md:hidden sticky top-0 z-40">
        <div className="h-14 px-4 flex items-center justify-between text-white bg-gradient-to-r from-sky-700 to-indigo-800 border-b border-white/10">
          {/* Left: Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10 transition"
            aria-label="Open menu"
          >
            <span className="block w-5 h-0.5 bg-white mb-1" />
            <span className="block w-5 h-0.5 bg-white mb-1" />
            <span className="block w-5 h-0.5 bg-white" />
          </button>

          {/* Center: Brand */}
          <div className="text-center">
            <div className="text-sm font-bold tracking-wide leading-4">NEXAS</div>
            <div className="text-[10px] text-white/70 leading-4">Powered by VentureCorp</div>
          </div>

          {/* Right: Avatar */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-sky-300 flex items-center justify-center font-bold text-indigo-900">
            {initials}
          </div>
        </div>
      </header>

      {/* ================= DESKTOP SIDEBAR (visible md+) ================= */}
      <aside className="hidden md:flex h-screen w-64 bg-gradient-to-b from-sky-700 to-indigo-800 text-white flex-col">
        {Brand}
        {Menu}
        {ProfileCard}
        {Footer}
      </aside>

      {/* ================= MOBILE DRAWER (slide-in) ================= */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Drawer */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-gradient-to-b from-sky-700 to-indigo-800 text-white flex flex-col shadow-2xl transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
        >
          {/* Drawer header with close */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
            <div>
              <div className="text-lg font-bold tracking-wide">NEXAS</div>
              <div className="text-[11px] text-white/70">Powered by VentureCorp</div>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 hover:bg-white/10 transition"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Menu */}
          {Menu}

          {/* Profile + footer */}
          {ProfileCard}
          {Footer}
        </div>
      </div>
    </>
  );
}
