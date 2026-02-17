import { api } from "./axios";

/* =======================
   Types
======================= */

export type MeetingStatus = "SCHEDULED" | "DONE" | "CANCELED";
export type ParticipantType = "ADMIN" | "COMPANY_CONTACT" | "EXTERNAL";

export type MeetingParticipant = {
  participantId: number;
  participantType: ParticipantType | string;

  adminId: number | null;
  adminUsername: string | null;

  companyContactPersonId: number | null;
  companyContactPersonName: string | null;

  name: string | null;
  email: string | null;
  phoneNumber: string | null;
};

export type CalendarMeeting = {
  meetingId: number;
  ticketId: number;

  stageId: number | null;
  stageName: string | null;

  meetingAtUtc: string; // UTC ISO (Z)
  status: MeetingStatus;

  meetingLink: string | null;
  location: string | null;
  agenda: string | null;

  companyName: string | null;
  branchName: string | null;

  participants: MeetingParticipant[];
};

export type CalendarRangeParams = {
  fromUtc?: string;
  toUtc?: string;
};

/* =======================
   SINGLE CALENDAR API
   (role-based response)
======================= */

export async function listMeetings(
  params?: CalendarRangeParams
): Promise<CalendarMeeting[]> {
  const { data } = await api.get<CalendarMeeting[]>("/api/calendar", { params });
  console.log("API: listMeetings", { params, data });
  return data ?? [];
}

// optional alias (if your UI uses getMeetings naming)
export async function getMeetings(
  params?: CalendarRangeParams
): Promise<CalendarMeeting[]> {
  return listMeetings(params);
}
