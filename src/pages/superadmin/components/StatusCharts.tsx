import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export type StatusCount = { name: string; value: number };

const PIE_COLORS = ["#38bdf8", "#818cf8", "#fbbf24", "#34d399", "#fb7185", "#a78bfa"];

export default function StatusCharts({
  title,
  barData,
  pieData,
  pieLabel = "Pie",
}: {
  title: string;
  barData: StatusCount[];
  pieData: StatusCount[];
  pieLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">Bar + Pie</span>
      </div>

      {barData.length === 0 ? (
        <div className="mt-4 text-sm text-slate-500">No data</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar */}
          <div className="rounded-xl border border-slate-100 p-3">
            <div className="text-sm font-semibold text-slate-800 mb-2">Bar</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie */}
          <div className="rounded-xl border border-slate-100 p-3">
            <div className="text-sm font-semibold text-slate-800 mb-2">{pieLabel}</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
