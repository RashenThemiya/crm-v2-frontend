import { useEffect, useState } from "react";
import { listTicketStages, type TicketStage } from "../../../api/ticketStage.api";

export function useTicketStagesByType(ticketTypeId: number | null) {
  const [stages, setStages] = useState<TicketStage[]>([]);
  const [loading, setLoading] = useState(false);

  async function reload() {
    if (!ticketTypeId) {
      setStages([]);
      return;
    }
    setLoading(true);
    try {
      const s = await listTicketStages(ticketTypeId);
      setStages(s.slice().sort((a, b) => a.stageOrder - b.stageOrder));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketTypeId]);

  return { stages, loading, reload };
}
