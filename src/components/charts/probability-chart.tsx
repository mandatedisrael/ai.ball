"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import type { ProbabilityComparison } from "@/types/analysis";

interface ProbabilityChartProps {
  comparisons: ProbabilityComparison[];
}

export function ProbabilityChart({ comparisons }: ProbabilityChartProps) {
  const data = comparisons.map((row) => ({
    outcome: row.label.replace(" Win", ""),
    model: Number((row.model * 100).toFixed(1)),
    market:
      row.polymarket !== undefined
        ? Number((row.polymarket * 100).toFixed(1))
        : undefined,
  }));

  return (
    <div className="card p-5">
      <p className="label mb-4">Probability comparison</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis dataKey="outcome" tick={{ fontSize: 12, fill: CHART_TICK_COLOR }} />
            <YAxis unit="%" tick={{ fontSize: 12, fill: CHART_TICK_COLOR }} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend />
            <Bar dataKey="model" name="AI Model" fill="#16a34a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="market" name="Polymarket" fill="#0369a1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}