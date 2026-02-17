import { api } from "./axios";

export type TicketStatus = "OPEN" | "PROCESSING" | "ON_HOLD" | "CLOSED" | "CANCELED";

export type Ticket = {
  ticketId: number;

  companyId: number;
  companyName: string;

  branchId: number;
  branchName: string;

  ticketTypeId: number;
  ticketTypeName: string;

  currentStageId: number;
  currentStageName: string;

  assignedAdminId: number | null;
  assignedAdminUsername: string | null;

  status: TicketStatus;

  createdByAdminId: number;
  createdByUsername: string;

  updatedByAdminId: number | null;
  updatedByUsername: string | null;

  createdAtUtc: string;
  updatedAtUtc: string;
};

export type CreateTicketPayload = {
  companyId: number;
  branchId: number;
  ticketTypeId: number;
  initialStageId: number;
  assignedAdminId?: number | null;
};

export type UpdateTicketPayload = {
  assignedAdminId?: number | null;
  status?: TicketStatus;
  newStageId?: number | null;
  stageChangeNote?: string | null;
};

export async function listTickets(): Promise<Ticket[]> {
  const { data } = await api.get<Ticket[]>("/api/tickets");
  return data;
}

export async function getTicket(id: number): Promise<Ticket> {
  const { data } = await api.get<Ticket>(`/api/tickets/${id}`);
  return data;
}

export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  const { data } = await api.post<Ticket>("/api/tickets", payload);
  return data;
}

export async function updateTicket(id: number, payload: UpdateTicketPayload): Promise<Ticket> {
  const { data } = await api.put<Ticket>(`/api/tickets/${id}`, payload);
  return data;
}

export async function deleteTicket(id: number): Promise<void> {
  await api.delete(`/api/tickets/${id}`);
}
