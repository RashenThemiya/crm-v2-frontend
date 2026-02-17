import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Briefcase, Home, Mail, Menu, X, Sparkles } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center gap-2",
      isActive
        ? "bg-sky-500 text-white"
        : "text-slate-700 hover:bg-slate-100"
    );

  const navItems = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/jobs", label: "Jobs", icon: Briefcase },
    { to: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full pt-4 pb-4 px-4 sm:px-6 lg:px-8 bg-slate-50">
      {/* Centered Box Container */}
      <header className="mx-auto max-w-6xl relative">
        {/* Main Navbar Box */}
        <div className={cn(
          "relative bg-white rounded-2xl transition-all duration-300 border border-slate-200",
          isScrolled
            ? "shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
            : "shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
        )}>
          <div className="px-6 sm:px-8">
            <div className="flex h-20 items-center justify-between">
              {/* Logo Section */}
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="h-12 w-12 rounded-xl bg-sky-500 grid place-items-center text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    Nexas
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Find Your Dream Job
                  </div>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={linkClass} end={to === "/home"}>
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </NavLink>
                ))}
                
                <button className="ml-3 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/30">
                  Get Started
                </button>
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden pb-6 border-t border-slate-100 pt-4 mt-2">
                <nav className="flex flex-col gap-2">
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={linkClass}
                      end={to === "/home"}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                  
                  <button className="mt-3 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 w-full">
                    Get Started
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Shadow for depth */}
        <div className="absolute -bottom-2 left-8 right-8 h-3 bg-slate-900/5 blur-md rounded-full"></div>
      </header>
    </div>
  );
}