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
  compact?: boolean;
}

function chartShellClass(compact?: boolean, embedded?: boolean) {
  if (compact) {
    return "rounded-xl border border-border bg-surface-elevated/35 p-3 sm:p-4 h-full";
  }
  if (embedded) {
    return "rounded-2xl border border-border bg-surface-elevated/35 p-4 sm:p-5";
  }
  return "card p-5";
}

function chartHeightClass(compact?: boolean, embedded?: boolean) {
  if (compact) return "h-44 w-full";
  if (embedded) return "h-72 w-full sm:h-80";
  return "h-64 w-full";
}

export function ProbabilityChart({
  comparisons,
  embedded = false,
  compact = false,
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
  const peak = Math.max(
    ...data.flatMap((row) => [row.model, row.market ?? 0]),
    1,
  );
  const yMax = Math.min(100, Math.max(30, Math.ceil((peak + 6) / 5) * 5));

  const chart = (
    <div className={chartHeightClass(compact, embedded)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barGap={compact ? 6 : 10}
          barCategoryGap={compact ? "14%" : "18%"}
          margin={compact ? { top: 4, right: 4, left: -18, bottom: 0 } : undefined}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.grid}
            vertical={false}
          />
          <XAxis
            dataKey="outcome"
            tick={{ fontSize: compact ? 10 : 12, fill: chartTheme.tick }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            unit="%"
            tick={{ fontSize: compact ? 10 : 12, fill: chartTheme.tick }}
            axisLine={false}
            tickLine={false}
            domain={[0, yMax]}
            ticks={compact ? [0, yMax / 2, yMax] : undefined}
          />
          <Tooltip contentStyle={chartTheme.tooltip} />
          <Legend
            wrapperStyle={{
              fontSize: compact ? "10px" : "12px",
              paddingTop: compact ? "6px" : "12px",
            }}
            iconType="circle"
            iconSize={compact ? 8 : 10}
          />
          <Bar
            dataKey="model"
            name="AI Model"
            fill="var(--accent)"
            radius={[4, 4, 0, 0]}
            maxBarSize={compact ? 28 : 48}
          />
          {hasMarket && (
            <Bar
              dataKey="market"
              name="Polymarket"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={compact ? 28 : 48}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className={chartShellClass(compact, embedded)}>
      <p className="label mb-0.5">Probability comparison</p>
      <p className="text-muted mb-2 text-xs">AI model vs prediction market</p>
      {chart}
    </div>
  );
}