// src/api/ticketMeeting.api.ts
import { api } from "./axios";

export type MeetingStatus = "SCHEDULED" | "DONE" | "CANCELED";
export type ParticipantType = "ADMIN" | "COMPANY_CONTACT" | "EXTERNAL";

export type TicketMeetingParticipant = {
  participantId: number;
  participantType: ParticipantType;

  adminId: number | null;
  adminUsername: string | null;

  companyContactPersonId: number | null;
  companyContactName: string | null;

  name: string | null;
  email: string | null;
  phoneNumber: string | null;
};

export type TicketMeeting = {
  ticketMeetingId: number;
  ticketId: number;
  stageId: number | null;
  stageName: string | null;

  meetingAtUtc: string;
  status: MeetingStatus;

  meetingLink: string | null;
  location: string | null;
  agenda: string | null;

  createdBy: string;
  createdAtUtc: string;

  participants: TicketMeetingParticipant[];
};

export type CreateMeetingPayload = {
  ticketId: number;
  stageId?: number | null;
  meetingAtUtc: string; // UTC ISO (Z)
  meetingLink?: string | null;
  location?: string | null;
  agenda?: string | null;
  participants: Array<
    | { participantType: "ADMIN"; adminId: number }
    | { participantType: "COMPANY_CONTACT"; companyContactPersonId: number }
    | { participantType: "EXTERNAL"; name: string; email?: string | null; phoneNumber?: string | null }
  >;
};

export type UpdateMeetingPayload = {
  meetingAtUtc?: string; // UTC ISO (Z)
  status?: MeetingStatus;
  agenda?: string | null;
  meetingLink?: string | null;
  location?: string | null;
};

export type AddParticipantPayload =
  | { participantType: "ADMIN"; adminId: number }
  | { participantType: "COMPANY_CONTACT"; companyContactPersonId: number }
  | { participantType: "EXTERNAL"; name: string; email?: string | null; phoneNumber?: string | null };

export async function listMeetings(ticketId: number): Promise<TicketMeeting[]> {
  const { data } = await api.get<TicketMeeting[]>(`/api/ticket-meetings`, { params: { ticketId } });
  return data;
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<TicketMeeting> {
  const { data } = await api.post<TicketMeeting>("/api/ticket-meetings", payload);
  return data;
}

export async function updateMeeting(meetingId: number, payload: UpdateMeetingPayload): Promise<TicketMeeting> {
  const { data } = await api.put<TicketMeeting>(`/api/ticket-meetings/${meetingId}`, payload);
  return data;
}


// Backend endpoint example: /api/ticket-meetings/1/participants :contentReference[oaicite:1]{index=1}
export async function addParticipant(meetingId: number, payload: AddParticipantPayload): Promise<TicketMeetingParticipant> {
  const { data } = await api.post<TicketMeetingParticipant>(`/api/ticket-meetings/${meetingId}/participants`, payload);
  return data;
}

export async function deleteParticipant(participantId: number): Promise<void> {
  await api.delete(`/api/ticket-meetings/participants/${participantId}`);
}
