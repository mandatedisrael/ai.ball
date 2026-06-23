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
import type { HeadToHeadMatch } from "@/types/fixture";

interface H2HChartProps {
  matches: HeadToHeadMatch[];
  homeTeam: string;
  awayTeam: string;
}

export function H2HChart({ matches, homeTeam, awayTeam }: H2HChartProps) {
  const data = matches.slice(0, 5).map((match) => ({
    date: match.date.slice(5),
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
  }));

  if (data.length === 0) {
    return (
      <div className="card p-5">
        <p className="label mb-2">Head-to-head goals</p>
        <p className="text-muted text-sm">No recent H2H data available.</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="label mb-4">Head-to-head goals</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: CHART_TICK_COLOR }} />
            <YAxis tick={{ fontSize: 12, fill: CHART_TICK_COLOR }} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend />
            <Bar
              dataKey="homeGoals"
              name={homeTeam}
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="awayGoals"
              name={awayTeam}
              fill="#0369a1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}