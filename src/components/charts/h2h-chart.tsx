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
import type { HeadToHeadMatch } from "@/types/fixture";

interface H2HChartProps {
  matches: HeadToHeadMatch[];
  homeTeam: string;
  awayTeam: string;
  compact?: boolean;
}

export function H2HChart({
  matches,
  homeTeam,
  awayTeam,
  compact = false,
}: H2HChartProps) {
  const chartTheme = useChartTheme();
  const data = matches.slice(0, 5).map((match) => ({
    date: match.date.slice(5),
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
  }));

  const shell = compact
    ? "rounded-xl border border-border bg-surface-elevated/35 p-3 sm:p-4 h-full"
    : "card p-5";

  if (data.length === 0) {
    return (
      <div className={shell}>
        <p className="label mb-2">Head-to-head goals</p>
        <p className="text-muted flex h-40 items-center justify-center text-xs">
          No recent H2H data available.
        </p>
      </div>
    );
  }

  const maxGoals = Math.max(
    ...data.flatMap((row) => [row.homeGoals, row.awayGoals]),
    1,
  );
  const yMax = Math.max(3, maxGoals + 1);

  return (
    <div className={shell}>
      <p className="label mb-2">Head-to-head goals</p>
      <div className={compact ? "h-40 w-full" : "h-64 w-full"}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={compact ? { top: 4, right: 4, left: -18, bottom: 0 } : undefined}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: compact ? 10 : 12, fill: chartTheme.tick }}
            />
            <YAxis
              domain={[0, yMax]}
              tick={{ fontSize: compact ? 10 : 12, fill: chartTheme.tick }}
              allowDecimals={false}
            />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Legend
              wrapperStyle={{ fontSize: compact ? "10px" : "12px" }}
              iconSize={compact ? 8 : 10}
            />
            <Bar
              dataKey="homeGoals"
              name={homeTeam}
              fill="#16a34a"
              radius={[3, 3, 0, 0]}
              maxBarSize={compact ? 20 : undefined}
            />
            <Bar
              dataKey="awayGoals"
              name={awayTeam}
              fill="#0369a1"
              radius={[3, 3, 0, 0]}
              maxBarSize={compact ? 20 : undefined}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}