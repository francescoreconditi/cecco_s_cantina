"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Wine } from "@/lib/types/database";

interface WineTypeChartProps {
  wines: Wine[];
}

export function WineTypeChart({ wines }: WineTypeChartProps) {
  // Raggruppa vini per tipologia
  const typeData = Object.entries(
    wines.reduce(
      (acc, wine) => {
        const type = wine.tipologia || "Non specificato";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // Ordina per conteggio decrescente

  if (typeData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500">
        <p>Nessun dato disponibile</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={typeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{
            value: "Numero Vini",
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 12 },
          }}
        />
        <Tooltip
          cursor={{ fill: "rgba(124, 45, 18, 0.1)" }}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
          }}
          formatter={(value: number) => [`${value} vini`, "Quantità"]}
        />
        <Bar dataKey="count" fill="#7c2d12" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
