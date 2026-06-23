"use client";

import { useEffect, useState } from "react";

import { useTheme } from "@/components/theme-provider";

export interface ChartTheme {
  grid: string;
  tick: string;
  tooltip: {
    background: string;
    border: string;
    borderRadius: string;
    color: string;
  };
}

function readChartTheme(): ChartTheme {
  if (typeof window === "undefined") {
    return {
      grid: "rgba(120, 120, 120, 0.12)",
      tick: "#8b8b88",
      tooltip: {
        background: "#161618",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "0.75rem",
        color: "#ededec",
      },
    };
  }

  const styles = getComputedStyle(document.documentElement);
  return {
    grid: styles.getPropertyValue("--chart-grid").trim() || "rgba(120,120,120,0.12)",
    tick: styles.getPropertyValue("--chart-tick").trim() || "#8b8b88",
    tooltip: {
      background:
        styles.getPropertyValue("--chart-tooltip-bg").trim() || "#161618",
      border: `1px solid ${styles.getPropertyValue("--chart-tooltip-border").trim() || "rgba(255,255,255,0.1)"}`,
      borderRadius: "0.75rem",
      color:
        styles.getPropertyValue("--chart-tooltip-fg").trim() || "#ededec",
    },
  };
}

export function useChartTheme(): ChartTheme {
  const { theme } = useTheme();
  const [chartTheme, setChartTheme] = useState<ChartTheme>(() =>
    readChartTheme(),
  );

  useEffect(() => {
    setChartTheme(readChartTheme());
  }, [theme]);

  return chartTheme;
}