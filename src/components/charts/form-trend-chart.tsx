"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartTheme } from "@/hooks/use-chart-theme";
import type { TeamForm } from "@/types/fixture";

interface FormTrendChartProps {
  homeTeam: string;
  awayTeam: string;
  homeForm: TeamForm;
  awayForm: TeamForm;
  compact?: boolean;
}

function buildSeries(form: TeamForm, prefix: string) {
  let cumulative = 0;
  return form.results.map((result, index) => {
    cumulative += result === "W" ? 3 : result === "D" ? 1 : 0;
    return {
      match: `${prefix}${index + 1}`,
      points: cumulative,
    };
  });
}

export function FormTrendChart({
  homeTeam,
  awayTeam,
  homeForm,
  awayForm,
  compact = false,
}: FormTrendChartProps) {
  const chartTheme = useChartTheme();
  const home = buildSeries(homeForm, "H");
  const away = buildSeries(awayForm, "A");
  const data = home.map((point, index) => ({
    match: point.match.replace("H", "M"),
    [homeTeam]: point.points,
    [awayTeam]: away[index]?.points ?? 0,
  }));

  const shell = compact
    ? "rounded-xl border border-border bg-surface-elevated/35 p-3 sm:p-4 h-full"
    : "card p-5";

  return (
    <div className={shell}>
      <p className="label mb-2">Form trend (points)</p>
      <div className={compact ? "h-40 w-full" : "h-64 w-full"}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={compact ? { top: 4, right: 4, left: -18, bottom: 0 } : undefined}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis
              dataKey="match"
              tick={{ fontSize: compact ? 10 : 12, fill: chartTheme.tick }}
            />
            <YAxis tick={{ fontSize: compact ? 10 : 12, fill: chartTheme.tick }} />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Line
              type="monotone"
              dataKey={homeTeam}
              stroke="#16a34a"
              strokeWidth={compact ? 1.5 : 2}
              dot={{ r: compact ? 2 : 3, fill: "#34d399" }}
            />
            <Line
              type="monotone"
              dataKey={awayTeam}
              stroke="#0369a1"
              strokeWidth={compact ? 1.5 : 2}
              dot={{ r: compact ? 2 : 3, fill: "#0369a1" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}