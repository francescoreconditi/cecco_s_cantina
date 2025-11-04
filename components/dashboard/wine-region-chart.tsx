"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Wine } from "@/lib/types/database";

const WINE_COLORS = [
  "#7c2d12", // wine-900
  "#991b1b", // red-800
  "#b45309", // amber-700
  "#a16207", // yellow-700
  "#65a30d", // lime-600
  "#059669", // emerald-600
  "#0891b2", // cyan-600
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#c026d3", // fuchsia-600
];

interface WineRegionChartProps {
  wines: Wine[];
}

export function WineRegionChart({ wines }: WineRegionChartProps) {
  // Raggruppa vini per regione
  const regionData = Object.entries(
    wines.reduce(
      (acc, wine) => {
        const region = wine.regione || "Non specificato";
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Ordina per valore decrescente

  if (regionData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500">
        <p>Nessun dato disponibile</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={regionData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {regionData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={WINE_COLORS[index % WINE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value} vini`, "Quantità"]}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
