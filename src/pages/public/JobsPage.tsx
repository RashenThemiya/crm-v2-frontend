// src/pages/public/JobsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import PublicNavbar from "../../components/PublicNavbar";
import { listJobPostings, type JobPosting, type JobCategory } from "../../api/jobPosting.api";
import JobFilters from "../../components/JobFilters";
import JobCard from "../../components/JobCard";
import JobDetailModal from "../../components/JobDetailModal";
import ApplicationModal from "../../components/ApplicationModal";
import { isExpired } from "../../utils/date";

function s(v: string | null | undefined, fallback = "") {
  const t = (v ?? "").trim();
  return t ? t : fallback;
}

function ms(iso?: string | null) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

export default function JobsPage() {
  const [items, setItems] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [companyId, setCompanyId] = useState<number | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<JobCategory | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await listJobPostings();

      const published = (data ?? []).filter(
        (j) => j.status === "PUBLISHED" && !isExpired(j.expireAtUtc)
      );

      published.sort((a, b) => {
        const aMs = ms(a.createdAtUtc) ?? 0;
        const bMs = ms(b.createdAtUtc) ?? 0;
        return bMs - aMs;
      });

      setItems(published);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const companies = useMemo(() => {
    const map = new Map<number, string>();
    for (const j of items) map.set(j.companyId, s(j.companyName, "Unknown"));
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: items.length,
      IT: 0,
      HR: 0,
      FINANCE: 0,
      MARKETING: 0,
      SALES: 0,
      ENGINEERING: 0,
      OPERATIONS: 0,
      OTHER: 0,
    };

    items.forEach((job) => {
      const cat = (job.jobCategory || "OTHER") as string;
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    const fromMs = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : null;
    const toMs = dateRange.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : null;

    return items.filter((j) => {
      const okCompany = companyId === "ALL" ? true : j.companyId === companyId;
      const okCategory =
        categoryFilter === "ALL" ? true : (j.jobCategory || "OTHER") === categoryFilter;

      const okQ =
        !qq ||
        s(j.jobRole).toLowerCase().includes(qq) ||
        s(j.companyName).toLowerCase().includes(qq) ||
        s(j.branchName).toLowerCase().includes(qq);

      let okDate = true;
      const pubMs = ms(j.publishedAtUtc);

      if (fromMs !== null) {
        okDate = okDate && pubMs !== null && pubMs >= fromMs;
      }
      if (toMs !== null) {
        okDate = okDate && pubMs !== null && pubMs <= toMs;
      }

      return okCompany && okCategory && okQ && okDate;
    });
  }, [items, q, companyId, categoryFilter, dateRange]);

  const handleReadMore = (job: JobPosting) => {
    setSelectedJob(job);
    setShowApplicationModal(false);
    setShowDetailModal(true);
  };

  const handleApplyClick = (job: JobPosting) => {
    setSelectedJob(job);
    setShowDetailModal(false);
    setShowApplicationModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
      <PublicNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 pt-34">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Fixed Filters - Hidden on mobile, fixed on desktop */}
          <div className="hidden lg:block lg:w-80">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <JobFilters
                companies={companies}
                companyId={companyId}
                searchQuery={q}
                categoryFilter={categoryFilter}
                dateRange={dateRange}
                categoryCounts={categoryCounts}
                onCompanyChange={setCompanyId}
                onSearchChange={setQ}
                onCategoryChange={setCategoryFilter}
                onDateRangeChange={setDateRange}
                onRefresh={load}
              />
            </div>
          </div>

          {/* Mobile Filters Toggle - Only visible on mobile */}
          <div className="lg:hidden">
            <details className="rounded-3xl bg-white border border-blue-100 shadow-lg overflow-hidden">
              <summary className="px-6 py-4 font-bold text-blue-900 cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between">
                <span>Filters & Search</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-blue-100">
                <JobFilters
                  companies={companies}
                  companyId={companyId}
                  searchQuery={q}
                  categoryFilter={categoryFilter}
                  dateRange={dateRange}
                  categoryCounts={categoryCounts}
                  onCompanyChange={setCompanyId}
                  onSearchChange={setQ}
                  onCategoryChange={setCategoryFilter}
                  onDateRangeChange={setDateRange}
                  onRefresh={load}
                />
              </div>
            </details>
          </div>

          {/* Right: Job Listings */}
          <div className="flex-1">
            {loading ? (
              <div className="rounded-3xl bg-white border border-blue-100 shadow-lg p-6 text-blue-600">
                Loading jobs...
              </div>
            ) : err ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">{err}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-blue-900">
                    {filtered.length} {filtered.length === 1 ? "Position" : "Positions"} Available
                  </h2>
                </div>

                {filtered.map((j) => (
                  <JobCard key={j.jobPostingId} job={j} onReadMore={handleReadMore} />
                ))}

                {filtered.length === 0 && (
                  <div className="rounded-3xl bg-white border border-blue-100 shadow-lg p-12 text-center">
                    <div className="text-blue-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-blue-600 font-semibold">No jobs found matching your criteria</p>
                    <p className="text-blue-500 text-sm mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {showDetailModal && selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setShowDetailModal(false)}
          onApply={handleApplyClick}
        />
      )}

      {showApplicationModal && selectedJob && (
        <ApplicationModal job={selectedJob} onClose={() => setShowApplicationModal(false)} />
      )}
    </div>
  );
}