"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartTheme } from "@/hooks/use-chart-theme";
import type { KeyFactor } from "@/types/analysis";

interface FactorChartProps {
  factors: KeyFactor[];
}

export function FactorChart({ factors }: FactorChartProps) {
  const chartTheme = useChartTheme();
  const data = factors.map((factor) => ({
    name: factor.factor,
    weight: Number((factor.weight * 100).toFixed(0)),
  }));

  return (
    <div className="card p-5">
      <p className="label mb-4">Factor weights</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: chartTheme.tick }} />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 11, fill: chartTheme.tick }}
            />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Bar dataKey="weight" fill="#16a34a" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}