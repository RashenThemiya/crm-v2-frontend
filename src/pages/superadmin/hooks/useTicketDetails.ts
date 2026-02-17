import { useEffect, useState } from "react";
import { getTicket, type Ticket } from "../../../api/ticket.api";
import { listTicketNotes, type TicketNote } from "../../../api/ticketNote.api";
import { listMeetings, type TicketMeeting } from "../../../api/ticketMeeting.api";
import {
  listTicketStageHistory,
  type TicketStageHistory,
} from "../../../api/ticketStageHistory.api";

export function useTicketDetails(ticketId: number | null) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState<TicketNote[]>([]);
  const [meetings, setMeetings] = useState<TicketMeeting[]>([]);
  const [history, setHistory] = useState<TicketStageHistory[]>([]); // ✅ NEW

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function reload() {
    if (!ticketId) return;

    setLoading(true);
    setErr("");

    try {
      const [t, n, m, h] = await Promise.all([
        getTicket(ticketId),
        listTicketNotes(ticketId),
        listMeetings(ticketId),
        listTicketStageHistory(ticketId), // ✅ NEW
      ]);

      setTicket(t);
      setNotes(n);
      setMeetings(m);
      setHistory(h);
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load ticket details"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ticketId) {
      // reset when drawer closes
      setTicket(null);
      setNotes([]);
      setMeetings([]);
      setHistory([]); // ✅ NEW
      setErr("");
      setLoading(false);
      return;
    }

    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  return {
    ticket,
    notes,
    meetings,
    history, // ✅ EXPOSE HISTORY
    loading,
    err,
    reload,
    setTicket,
  };
}
