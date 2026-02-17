import { useEffect, useMemo, useState } from "react";
import { listCompanies, type Company } from "../../../api/company.api";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function reload() {
    setLoading(true);
    setErr("");
    try {
      setCompanies(await listCompanies());
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  return { companies, loading, err, reload };
}

export function useCompanySearch(companies: Company[], q: string) {
  return useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return companies;

    return companies.filter((c) => {
      const hay = [
        c.name,
        c.email ?? "",
        c.phoneNumber ?? "",
        c.timezoneString ?? "",
        c.note ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(s);
    });
  }, [companies, q]);
}
