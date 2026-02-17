import { useEffect, useState } from "react";
import { listTicketTypes, type TicketType } from "../../../api/ticketType.api";

export function useTicketTypes() {
  const [types, setTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function reload() {
    setLoading(true);
    setErr("");
    try {
      setTypes(await listTicketTypes());
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load ticket types");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  return { types, loading, err, reload };
}
