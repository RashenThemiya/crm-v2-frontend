// src/pages/public/components/JobFilters.tsx
import React from "react";
import { type JobCategory } from "../api/jobPosting.api";

type Company = {
  id: number;
  name: string;
};

type JobFiltersProps = {
  companies: Company[];
  companyId: number | "ALL";
  searchQuery: string;
  categoryFilter: JobCategory | "ALL";
  dateRange: { from: string; to: string };
  categoryCounts: Record<string, number>;
  onCompanyChange: (id: number | "ALL") => void;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: JobCategory | "ALL") => void;
  onDateRangeChange: (range: { from: string; to: string }) => void;
  onRefresh: () => void;
};

const CATEGORIES: Array<{ value: JobCategory | "ALL"; label: string; icon: string }> = [
  { value: "ALL", label: "All Categories", icon: "📋" },
  { value: "IT", label: "IT & Technology", icon: "💻" },
  { value: "ENGINEERING", label: "Engineering", icon: "⚙️" },
  { value: "MARKETING", label: "Marketing", icon: "📢" },
  { value: "SALES", label: "Sales", icon: "💼" },
  { value: "FINANCE", label: "Finance", icon: "💰" },
  { value: "HR", label: "Human Resources", icon: "👥" },
  { value: "OPERATIONS", label: "Operations", icon: "📊" },
  { value: "OTHER", label: "Other", icon: "📁" },
];

export default function JobFilters({
  companies,
  companyId,
  searchQuery,
  categoryFilter,
  dateRange,
  categoryCounts,
  onCompanyChange,
  onSearchChange,
  onCategoryChange,
  onDateRangeChange,
  onRefresh,
}: JobFiltersProps) {
  return (
    <div className="lg:w-80 space-y-4">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-blue-100 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black text-blue-900">Filters</h1>
          <button
            onClick={onRefresh}
            className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            type="button"
          >
            Refresh
          </button>
        </div>

        {/* Search */}
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search jobs..."
          className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div className="rounded-3xl bg-white border border-blue-100 shadow-lg p-6">
        <h3 className="text-sm font-bold text-blue-900 mb-3">Job Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                categoryFilter === cat.value
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                categoryFilter === cat.value
                  ? "bg-white/20 text-white"
                  : "bg-blue-200 text-blue-700"
              }`}>
                {categoryCounts[cat.value] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Company Filter */}
      <div className="rounded-3xl bg-white border border-blue-100 shadow-lg p-6">
        <h3 className="text-sm font-bold text-blue-900 mb-3">Company</h3>
        <select
          value={companyId === "ALL" ? "ALL" : String(companyId)}
          onChange={(e) => onCompanyChange(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
          className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Companies</option>
          {companies.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="rounded-3xl bg-white border border-blue-100 shadow-lg p-6">
        <h3 className="text-sm font-bold text-blue-900 mb-3">Published Date</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-blue-700 mb-1">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-blue-700 mb-1">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {(dateRange.from || dateRange.to) && (
            <button
              onClick={() => onDateRangeChange({ from: "", to: "" })}
              className="w-full text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Clear Date Range
            </button>
          )}
        </div>
      </div>
    </div>
  );
}