import React, { useMemo } from "react";

export default function TimezoneSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (tz: string) => void;
}) {
  const timezones = useMemo(() => {
    if ("supportedValuesOf" in Intl) {
      return (Intl as any).supportedValuesOf("timeZone") as string[];
    }
    // fallback (minimum)
    return ["Asia/Colombo", "UTC"];
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
    >
      {timezones.map((tz) => (
        <option key={tz} value={tz}>
          {tz}
        </option>
      ))}
    </select>
  );
}
