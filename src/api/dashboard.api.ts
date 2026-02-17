import { api } from "./axios";

// ===============================
// COMMON TYPES
// ===============================

export type TicketStatusCount = {
  status: string; // "OPEN" | "CLOSED" | etc
  count: number;
};

export type JobStatusCount = {
  status: string; // "PUBLISHED" | etc
  count: number;
};

// ===============================
// DASHBOARD RESPONSE (ROLE BASED)
// Backend automatically decides
// ===============================

export type DashboardResponse = {
  totalAdmins: number;
  totalCompanies: number;
  totalBranches: number;
  totalTickets: number;
  totalJobPostings: number;
  totalUpcomingMeetings: number;
  ticketByStatus: TicketStatusCount[];
  jobByStatus: JobStatusCount[];
};

// ===============================
// SINGLE DASHBOARD API CALL
// ===============================

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>("/api/dashboard");
  return data;
}
