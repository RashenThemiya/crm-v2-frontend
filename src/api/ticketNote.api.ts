import { api } from "./axios";

export type TicketNote = {
  ticketNoteId: number;
  ticketId: number;
  stageId: number | null;
  stageName: string | null;
  noteTopic: string;
  note: string;
  createdBy: string;
  createdAtUtc: string;
};

export type CreateTicketNotePayload = {
  ticketId: number;
  stageId?: number | null;
  noteTopic: string;
  note: string;
};

export async function listTicketNotes(ticketId: number): Promise<TicketNote[]> {
  const { data } = await api.get<TicketNote[]>(`/api/ticket-notes?ticketId=${ticketId}`);
  return data;
}

export async function createTicketNote(payload: CreateTicketNotePayload): Promise<TicketNote> {
  const { data } = await api.post<TicketNote>("/api/ticket-notes", payload);
  return data;
}
