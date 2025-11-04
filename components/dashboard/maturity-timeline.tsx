"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Bottle } from "@/lib/types/database";

interface MaturityTimelineProps {
  bottles: Bottle[];
}

const MATURITY_COLORS: Record<string, string> = {
  pronta: "#22c55e", // green-500 - Pronta per essere bevuta
  in_evoluzione: "#f59e0b", // amber-500 - In evoluzione
  oltre_picco: "#ef4444", // red-500 - Oltre il picco
  "Non specificato": "#9ca3af", // gray-400
};

const MATURITY_LABELS: Record<string, string> = {
  pronta: "Pronta",
  in_evoluzione: "In evoluzione",
  oltre_picco: "Oltre il picco",
  "Non specificato": "Non specificato",
};

export function MaturityTimeline({ bottles }: MaturityTimelineProps) {
  // Raggruppa bottiglie per stato maturità
  const maturityData = Object.entries(
    bottles.reduce(
      (acc, bottle) => {
        const status = bottle.stato_maturita || "Non specificato";
        acc[status] = (acc[status] || 0) + bottle.quantita;
        return acc;
      },
      {} as Record<string, number>
    )
  )
    .map(([status, count]) => ({
      status: MATURITY_LABELS[status] || status,
      count,
      fill: MATURITY_COLORS[status] || MATURITY_COLORS["Non specificato"],
    }))
    .sort((a, b) => b.count - a.count);

  if (maturityData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500">
        <p>Nessun dato disponibile</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={maturityData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          type="number"
          tick={{ fontSize: 12 }}
          label={{
            value: "Numero Bottiglie",
            position: "insideBottom",
            offset: -5,
            style: { fontSize: 12 },
          }}
        />
        <YAxis dataKey="status" type="category" tick={{ fontSize: 12 }} />
        <Tooltip
          cursor={{ fill: "rgba(124, 45, 18, 0.1)" }}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
          }}
          formatter={(value: number) => [`${value} bottiglie`, "Quantità"]}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
          {maturityData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
