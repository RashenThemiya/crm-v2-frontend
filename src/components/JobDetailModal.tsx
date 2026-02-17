// src/pages/public/components/JobDetailModal.tsx
import React from "react";
import { type JobPosting } from "../api/jobPosting.api";
import { fmtColombo } from "../utils/date";

type JobDetailModalProps = {
  job: JobPosting;
  onClose: () => void;
  onApply: (job: JobPosting) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  IT: "bg-purple-100 text-purple-700 border-purple-200",
  ENGINEERING: "bg-orange-100 text-orange-700 border-orange-200",
  MARKETING: "bg-pink-100 text-pink-700 border-pink-200",
  SALES: "bg-green-100 text-green-700 border-green-200",
  FINANCE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HR: "bg-blue-100 text-blue-700 border-blue-200",
  OPERATIONS: "bg-cyan-100 text-cyan-700 border-cyan-200",
  OTHER: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function JobDetailModal({ job, onClose, onApply }: JobDetailModalProps) {
  const category = job.jobCategory || "OTHER";
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;
  const hasApplyEmail = job.applyEmail && job.applyEmail.trim();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 mb-3`}>
                {category}
              </span>
              <h2 className="text-2xl font-black mb-2">{job.jobRole || "—"}</h2>
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-semibold">{job.companyName || "Unknown Company"}</span>
                {job.branchName && (
                  <>
                    <span>•</span>
                    <span>{job.branchName}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors flex-shrink-0"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Photo */}
        {job.photoUrl && (
          <div className="w-full">
            <img src={job.photoUrl} className="w-full h-64 object-cover" alt="" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Job Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div className="text-xs font-semibold text-blue-700 mb-1">Job ID</div>
              <div className="text-lg font-bold text-blue-900">{job.jobPostingId}</div>
            </div>
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div className="text-xs font-semibold text-blue-700 mb-1">Published</div>
              <div className="text-sm font-bold text-blue-900">{fmtColombo(job.publishedAtUtc)}</div>
            </div>
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div className="text-xs font-semibold text-blue-700 mb-1">Expires</div>
              <div className="text-sm font-bold text-blue-900">{fmtColombo(job.expireAtUtc)}</div>
            </div>
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div className="text-xs font-semibold text-blue-700 mb-1">Status</div>
              <div className="text-sm font-bold text-green-600">Active</div>
            </div>
          </div>

          {/* Requirements */}
          {job.requirement && job.requirement.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-5">
              <h3 className="text-sm font-black text-purple-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Requirements
              </h3>
              <ul className="space-y-2">
                {job.requirement.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-purple-800">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Experience */}
          {job.experience && job.experience.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5">
              <h3 className="text-sm font-black text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Experience Required
              </h3>
              <ul className="space-y-2">
                {job.experience.map((exp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefit && job.benefit.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-5">
              <h3 className="text-sm font-black text-green-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Benefits & Perks
              </h3>
              <ul className="space-y-2">
                {job.benefit.map((ben, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          {hasApplyEmail && (
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5">
              <h3 className="text-sm font-black text-blue-900 mb-2">Contact</h3>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{job.applyEmail}</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Apply Button */}
        {hasApplyEmail && (
          <div className="sticky bottom-0 bg-white border-t border-blue-100 p-6 rounded-b-3xl">
            <button
              onClick={() => onApply(job)}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 text-base font-bold text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Apply for this Position
            </button>
          </div>
        )}
      </div>
    </div>
  );
}