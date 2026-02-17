import { api } from "./axios";

export type TicketStageHistory = {
  historyId: number;
  fromStage: string | null;
  toStage: string | null;
  changedBy: string;
  changedAtUtc: string;
  note: string | null;
};

export async function listTicketStageHistory(ticketId: number): Promise<TicketStageHistory[]> {
  const { data } = await api.get<TicketStageHistory[]>(`/api/ticket-stage-history/${ticketId}`);
  return data;
}
