// src/pages/public/components/ApplicationModal.tsx
import React, { useState } from "react";
import { type JobPosting } from "../api/jobPosting.api";

type ApplicationFormData = {
  name: string;
  email: string;
  contactNumber: string;
  cv: File | null;
};

type ApplicationModalProps = {
  job: JobPosting;
  onClose: () => void;
};

export default function ApplicationModal({ job, onClose }: ApplicationModalProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    email: "",
    contactNumber: "",
    cv: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const okExt = [".pdf", ".doc", ".docx"];
    const name = file.name.toLowerCase();
    const hasOkExt = okExt.some((x) => name.endsWith(x));
    
    if (!hasOkExt) {
      alert("Please upload PDF/DOC/DOCX only.");
      e.target.value = "";
      setFormData((p) => ({ ...p, cv: null }));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Max CV size is 5MB.");
      e.target.value = "";
      setFormData((p) => ({ ...p, cv: null }));
      return;
    }

    setFormData((p) => ({ ...p, cv: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cv) {
      alert("Please upload your CV/Resume.");
      return;
    }

    setSubmitting(true);
    try {
      const emailBody = `
Job Application

Position: ${job.jobRole || "-"}
Company: ${job.companyName || "-"}
Branch: ${job.branchName || "-"}
Job ID: ${job.jobPostingId}

Applicant Details:
Name: ${formData.name}
Email: ${formData.email}
Contact Number: ${formData.contactNumber}

Note: Please find my CV/Resume attached (${formData.cv.name})
      `.trim();

      const subject = `Job Application - ${job.jobRole || "Job"} (ID ${job.jobPostingId})`;
      const mailtoLink = `mailto:${job.applyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

      window.location.href = mailtoLink;

      alert("Your email client opened with pre-filled details.\nPlease attach your CV and send the email.");
      onClose();
    } catch {
      alert("Failed to prepare application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black">Apply for Position</h2>
              <p className="text-sm text-blue-100 mt-1">{job.jobRole || "—"}</p>
              <p className="text-xs text-blue-200">{job.companyName || "Unknown Company"}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.contactNumber}
              onChange={(e) => setFormData((p) => ({ ...p, contactNumber: e.target.value }))}
              className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+94 XX XXX XXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Upload CV/Resume <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              required
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-2.5 text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-blue-600 mt-1">Accepted formats: PDF, DOC, DOCX (max 5MB)</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Clicking submit will open your email client with pre-filled details.
              Please attach your CV before sending the email.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}