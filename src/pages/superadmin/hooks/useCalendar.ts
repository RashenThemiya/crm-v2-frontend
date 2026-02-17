import { useCallback, useEffect, useMemo, useState } from "react";
import type { CalendarMeeting, CalendarRangeParams } from "../../../api/calendar.api";
import { listMeetings } from "../../../api/calendar.api";

export function useCalendar(range?: CalendarRangeParams) {
  const [meetings, setMeetings] = useState<CalendarMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // stable deps
  const fromUtc = range?.fromUtc ?? "";
  const toUtc = range?.toUtc ?? "";

  const params = useMemo<CalendarRangeParams | undefined>(() => {
    const p: CalendarRangeParams = {};
    if (fromUtc) p.fromUtc = fromUtc;
    if (toUtc) p.toUtc = toUtc;
    return Object.keys(p).length ? p : undefined;
  }, [fromUtc, toUtc]);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const res = await listMeetings(params);
      setMeetings(res ?? []);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load meetings");
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await listMeetings(params);
        if (!cancelled) setMeetings(res ?? []);
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.response?.data?.message || e?.message || "Failed to load meetings");
          setMeetings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  const reload = useCallback(async () => {
    await fetchMeetings();
  }, [fetchMeetings]);

  return { meetings, loading, err, reload };
}
