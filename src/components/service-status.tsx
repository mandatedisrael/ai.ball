"use client";

import { useEffect, useState } from "react";

interface HealthResponse {
  mode: "live" | "football-only" | "demo";
  services: {
    apiFootball: boolean;
    zerogCompute: boolean;
    openWeather: boolean;
    polymarket: boolean;
  };
}

const MODE_LABELS: Record<HealthResponse["mode"], string> = {
  live: "Live mode",
  "football-only": "Football data only",
  demo: "Demo mode",
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
    <div className="bg-surface border-border flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-3 text-xs">
      <span className="bg-accent-soft text-accent rounded-full px-3 py-1 font-medium">
        {MODE_LABELS[health.mode]}
      </span>
      <StatusPill label="API-Football" active={health.services.apiFootball} />
      <StatusPill label="0G Compute" active={health.services.zerogCompute} />
      <StatusPill label="Weather" active={health.services.openWeather} />
      <StatusPill label="Polymarket" active={health.services.polymarket} />
    </div>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 ${
        active
          ? "bg-positive/10 text-positive"
          : "bg-surface-elevated text-muted"
      }`}
    >
      {label}
    </span>
  );
}