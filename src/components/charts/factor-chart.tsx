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

import {
  CHART_GRID_COLOR,
  CHART_TICK_COLOR,
  CHART_TOOLTIP_STYLE,
} from "@/components/charts/chart-theme";
import type { KeyFactor } from "@/types/analysis";

interface FactorChartProps {
  factors: KeyFactor[];
}

export function FactorChart({ factors }: FactorChartProps) {
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
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: CHART_TICK_COLOR }} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 11, fill: CHART_TICK_COLOR }}
            />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Bar dataKey="weight" fill="#16a34a" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}