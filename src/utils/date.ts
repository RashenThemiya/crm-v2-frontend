export function fmtLocal(isoUtc: string, tz = "Asia/Colombo") {
  try {
    const d = new Date(isoUtc);
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return isoUtc;
  }
}
export function fmtColombo(iso?: string | null) {
  if (!iso) return "-";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(t));
}

export function isExpired(expireAtUtc?: string | null) {
  if (!expireAtUtc) return false;
  const t = new Date(expireAtUtc).getTime();
  if (!Number.isFinite(t)) return false;
  return t < Date.now();
}

export function dayKey(isoUtc: string, tz = "Asia/Colombo") {
  try {
    const d = new Date(isoUtc);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d); // YYYY-MM-DD
  } catch {
    return isoUtc.slice(0, 10);
  }
}
