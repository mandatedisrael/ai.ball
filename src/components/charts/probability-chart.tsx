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

import { useChartTheme } from "@/hooks/use-chart-theme";
import type { ProbabilityComparison } from "@/types/analysis";

interface ProbabilityChartProps {
  comparisons: ProbabilityComparison[];
  embedded?: boolean;
}

export function ProbabilityChart({
  comparisons,
  embedded = false,
}: ProbabilityChartProps) {
  const chartTheme = useChartTheme();
  const data = comparisons.map((row) => ({
    outcome: row.label.replace(" Win", ""),
    model: Number((row.model * 100).toFixed(1)),
    market:
      row.polymarket !== undefined
        ? Number((row.polymarket * 100).toFixed(1))
        : undefined,
  }));

  const hasMarket = data.some((row) => row.market !== undefined);

  const chart = (
    <div className={embedded ? "h-72 w-full sm:h-80" : "h-64 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={10} barCategoryGap="18%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.grid}
            vertical={false}
          />
          <XAxis
            dataKey="outcome"
            tick={{ fontSize: 12, fill: chartTheme.tick }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            unit="%"
            tick={{ fontSize: 12, fill: chartTheme.tick }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip contentStyle={chartTheme.tooltip} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            iconType="circle"
          />
          <Bar
            dataKey="model"
            name="AI Model"
            fill="var(--accent)"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
          {hasMarket && (
            <Bar
              dataKey="market"
              name="Polymarket"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  if (embedded) {
    return (
      <div className="rounded-2xl border border-border bg-surface-elevated/35 p-4 sm:p-5">
        <p className="label mb-1">Probability comparison</p>
        <p className="text-muted mb-4 text-xs">AI model vs prediction market</p>
        {chart}
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="label mb-4">Probability comparison</p>
      {chart}
    </div>
  );
}