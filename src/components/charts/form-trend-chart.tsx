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

import {
  CHART_GRID_COLOR,
  CHART_TICK_COLOR,
  CHART_TOOLTIP_STYLE,
} from "@/components/charts/chart-theme";
import type { TeamForm } from "@/types/fixture";

interface FormTrendChartProps {
  homeTeam: string;
  awayTeam: string;
  homeForm: TeamForm;
  awayForm: TeamForm;
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
}: FormTrendChartProps) {
  const home = buildSeries(homeForm, "H");
  const away = buildSeries(awayForm, "A");
  const data = home.map((point, index) => ({
    match: point.match.replace("H", "M"),
    [homeTeam]: point.points,
    [awayTeam]: away[index]?.points ?? 0,
  }));

  return (
    <div className="card p-5">
      <p className="label mb-4">Form trend (points)</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis dataKey="match" tick={{ fontSize: 12, fill: CHART_TICK_COLOR }} />
            <YAxis tick={{ fontSize: 12, fill: CHART_TICK_COLOR }} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey={homeTeam}
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 3, fill: "#34d399" }}
            />
            <Line
              type="monotone"
              dataKey={awayTeam}
              stroke="#0369a1"
              strokeWidth={2}
              dot={{ r: 3, fill: "#0369a1" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}