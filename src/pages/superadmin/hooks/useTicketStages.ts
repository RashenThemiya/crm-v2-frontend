import { useEffect, useState } from "react";
import { listTicketStages, type TicketStage } from "../../../api/ticketStage.api";

export function useTicketStages(ticketTypeId: number | null) {
  const [stages, setStages] = useState<TicketStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function reload() {
    if (!ticketTypeId) {
      setStages([]);
      return;
    }
    setLoading(true);
    setErr("");
    try {
      setStages(await listTicketStages(ticketTypeId));
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load stages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketTypeId]);

  return { stages, loading, err, reload };
}
