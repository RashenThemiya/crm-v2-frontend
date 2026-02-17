// src/pages/public/components/JobCard.tsx
import React from "react";
import { type JobPosting } from "../api/jobPosting.api";
import { fmtColombo } from "../utils/date";

type JobCardProps = {
  job: JobPosting;
  onReadMore: (job: JobPosting) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  IT: "bg-purple-100 text-purple-700",
  ENGINEERING: "bg-orange-100 text-orange-700",
  MARKETING: "bg-pink-100 text-pink-700",
  SALES: "bg-green-100 text-green-700",
  FINANCE: "bg-yellow-100 text-yellow-700",
  HR: "bg-blue-100 text-blue-700",
  OPERATIONS: "bg-cyan-100 text-cyan-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export default function JobCard({ job, onReadMore }: JobCardProps) {
  const category = job.jobCategory || "OTHER";
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;

  return (
    <div className="rounded-3xl bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColor}`}>
              {category}
            </span>
          </div>
          
          <h3 className="text-xl font-black text-blue-900 mb-1 truncate">
            {job.jobRole || "—"}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
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

          <div className="flex flex-wrap gap-2 mb-4">
            {job.requirement && job.requirement.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="font-semibold text-blue-700">Requirements:</span>
                <span className="text-blue-600">{job.requirement.slice(0, 2).join(", ")}</span>
                {job.requirement.length > 2 && (
                  <span className="text-blue-500">+{job.requirement.length - 2} more</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-blue-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Posted: {fmtColombo(job.publishedAtUtc)}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Expires: {fmtColombo(job.expireAtUtc)}</span>
            </div>
          </div>
        </div>

        {job.photoUrl && (
          <img
            src={job.photoUrl}
            className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
            alt=""
          />
        )}
      </div>

      <button
        onClick={() => onReadMore(job)}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
      >
        Read More
      </button>
    </div>
  );
}