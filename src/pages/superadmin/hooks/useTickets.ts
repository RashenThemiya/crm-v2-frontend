import { useEffect, useMemo, useState } from "react";
import { listTickets, type Ticket, type TicketStatus } from "../../../api/ticket.api";

export type TicketFilters = {
  q: string;
  status: TicketStatus | "ALL";
  ticketTypeId: number | "ALL";
  companyId: number | "ALL";
  branchId: number | "ALL";
  assignedAdminId: number | "ALL";
};

const defaultFilters: TicketFilters = {
  q: "",
  status: "ALL",
  ticketTypeId: "ALL",
  companyId: "ALL",
  branchId: "ALL",
  assignedAdminId: "ALL",
};

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filters, setFilters] = useState<TicketFilters>(defaultFilters);

  async function reload() {
    setLoading(true);
    setErr("");
    try {
      setTickets(await listTickets());
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    return tickets.filter((t) => {
      if (filters.status !== "ALL" && t.status !== filters.status) return false;
      if (filters.ticketTypeId !== "ALL" && t.ticketTypeId !== filters.ticketTypeId) return false;
      if (filters.companyId !== "ALL" && t.companyId !== filters.companyId) return false;
      if (filters.branchId !== "ALL" && t.branchId !== filters.branchId) return false;
      if (filters.assignedAdminId !== "ALL" && (t.assignedAdminId ?? -1) !== filters.assignedAdminId)
        return false;

      if (!q) return true;

      const hay = [
        `#${t.ticketId}`,
        t.companyName,
        t.branchName,
        t.ticketTypeName,
        t.currentStageName,
        t.assignedAdminUsername ?? "",
        t.status,
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [tickets, filters]);

  return { tickets, filtered, loading, err, reload, filters, setFilters };
}
