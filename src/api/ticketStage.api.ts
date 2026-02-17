import { api } from "./axios";

export type TicketStage = {
  stageId: number;
  ticketTypeId: number;
  ticketTypeName: string;
  stageName: string;
  stageOrder: number;
  isFinal: boolean;
  isActive: boolean;
};

export type CreateTicketStagePayload = {
  ticketTypeId: number;
  stageName: string;
  stageOrder: number;
  isFinal: boolean;
  isActive: boolean;
};

export type UpdateTicketStagePayload = {
  stageName: string;
  stageOrder: number;
  isFinal: boolean;
  isActive: boolean;
};

export async function listTicketStages(ticketTypeId: number): Promise<TicketStage[]> {
  const { data } = await api.get<TicketStage[]>(`/api/ticket-stages?ticketTypeId=${ticketTypeId}`);
  return data;
}

export async function createTicketStage(payload: CreateTicketStagePayload): Promise<TicketStage> {
  const { data } = await api.post<TicketStage>("/api/ticket-stages", payload);
  return data;
}

export async function updateTicketStage(
  stageId: number,
  payload: UpdateTicketStagePayload
): Promise<TicketStage> {
  const { data } = await api.put<TicketStage>(`/api/ticket-stages/${stageId}`, payload);
  return data;
}

export async function deleteTicketStage(stageId: number): Promise<void> {
  await api.delete(`/api/ticket-stages/${stageId}`);
}
