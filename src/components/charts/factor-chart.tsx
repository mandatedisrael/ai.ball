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
  compact?: boolean;
}

export function FactorChart({ factors, compact = false }: FactorChartProps) {
  const chartTheme = useChartTheme();
  const data = factors.map((factor) => ({
    name: factor.factor,
    weight: Number((factor.weight * 100).toFixed(0)),
  }));

  const shell = compact
    ? "rounded-xl border border-border bg-surface-elevated/35 p-3 sm:p-4 h-full"
    : "card p-5";

  if (compact) {
    return (
      <div className={shell}>
        <p className="label mb-2">Factor weights</p>
        <ul className="space-y-2.5">
          {data.map((factor) => (
            <li key={factor.name}>
              <div className="mb-1 flex items-start justify-between gap-2 text-[10px] leading-4 sm:text-[11px]">
                <span className="text-foreground/90 min-w-0 flex-1" title={factor.name}>
                  {factor.name}
                </span>
                <span className="text-accent shrink-0 font-mono font-semibold">
                  {factor.weight}%
                </span>
              </div>
              <div className="bg-surface-elevated h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-500"
                  style={{ width: `${factor.weight}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={shell}>
      <p className="label mb-4">Factor weights</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis
              type="number"
              unit="%"
              tick={{ fontSize: 12, fill: chartTheme.tick }}
            />
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