"use client";

import { useEffect, useState } from "react";

interface FootballDataRateLimit {
  requestsAvailable: number | null;
  resetSeconds: number | null;
  client: string | null;
}

interface HealthResponse {
  mode: "live" | "football-only" | "compute-only" | "unconfigured";
  services: {
    football?: boolean;
    footballProvider?: "football-data" | "api-football" | "none";
    apiFootball?: boolean;
    footballData?: boolean;
    zerogCompute: boolean;
    openWeather: boolean;
    polymarket: boolean;
  };
  footballDataRateLimit?: FootballDataRateLimit | null;
}

const MODE_LABELS: Record<HealthResponse["mode"], string> = {
  live: "Live",
  "football-only": "Football only",
  "compute-only": "AI only",
  unconfigured: "Setup required",
};

export function ServiceStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    void fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthResponse) => setHealth(data))
      .catch(() => setHealth(null));
  }, []);

  if (!health) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          health.mode === "live"
            ? "bg-accent/15 text-accent"
            : "bg-warning/15 text-warning"
        }`}
      >
        {MODE_LABELS[health.mode]}
      </span>
      <StatusPill
        label={
          health.services.footballProvider === "football-data"
            ? "football-data.org"
            : "API-Football"
        }
        active={Boolean(health.services.football)}
      />
      <StatusPill label="0G Compute" active={health.services.zerogCompute} />
      <StatusPill label="Weather" active={health.services.openWeather} />
      <StatusPill label="Polymarket" active={health.services.polymarket} />
      {health.services.footballProvider === "football-data" &&
        health.footballDataRateLimit?.requestsAvailable != null && (
          <span className="text-muted rounded-full bg-surface-elevated px-3 py-1 text-xs font-medium">
            {health.footballDataRateLimit.requestsAvailable}/min left
            {health.footballDataRateLimit.resetSeconds != null &&
              ` · resets ${health.footballDataRateLimit.resetSeconds}s`}
          </span>
        )}
    </div>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-positive/10 text-positive"
          : "bg-surface-elevated text-muted"
      }`}
    >
      {label}
    </span>
  );
}