import { api } from "./axios";

export type TicketType = {
  ticketTypeId: number;
  name: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type CreateTicketTypePayload = {
  name: string;
};

export type UpdateTicketTypePayload = {
  name: string;
  isActive: boolean;
};

export async function listTicketTypes(): Promise<TicketType[]> {
  const { data } = await api.get<TicketType[]>("/api/ticket-types");
  return data;
}

export async function createTicketType(payload: CreateTicketTypePayload): Promise<TicketType> {
  const { data } = await api.post<TicketType>("/api/ticket-types", payload);
  return data;
}

export async function updateTicketType(
  id: number,
  payload: UpdateTicketTypePayload
): Promise<TicketType> {
  const { data } = await api.put<TicketType>(`/api/ticket-types/${id}`, payload);
  return data;
}

export async function deleteTicketType(id: number): Promise<void> {
  await api.delete(`/api/ticket-types/${id}`);
}
