"use client";

import { useEffect, useState } from "react";

import { AnalysisSourcePills } from "@/components/analysis-source-pills";
import type { AnalysisProgressStep } from "@/types/stream";

const STEP_HINTS: Record<AnalysisProgressStep, string[]> = {
  fixture: [
    "Resolving fixture details…",
    "Locking in kickoff and venue…",
  ],
  football: [
    "Fetching form, H2H, injuries, and standings…",
    "Reviewing recent results…",
  ],
  polymarket: [
    "Checking Polymarket for market context…",
    "Comparing crowd odds…",
  ],
  weather: [
    "Loading venue weather context…",
    "Factoring match-day conditions…",
  ],
  inference: [
    "Running 0G AI analyst…",
    "Crunching win probabilities…",
  ],
  complete: [
    "Packaging charts and trends…",
    "Almost ready…",
  ],
};

interface AnalysisResearchStageProps {
  activeStep: AnalysisProgressStep | null;
  message?: string | null;
  homeTeam?: string;
  awayTeam?: string;
}

export function AnalysisResearchStage({
  activeStep,
  message,
  homeTeam = "Home",
  awayTeam = "Away",
}: AnalysisResearchStageProps) {
  const step = activeStep ?? "fixture";
  const hints = STEP_HINTS[step];
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    setHintIndex(0);
  }, [step, message]);

  useEffect(() => {
    if (message) return;
    const interval = window.setInterval(() => {
      setHintIndex((current) => (current + 1) % hints.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [message, hints]);

  const hint = message ?? hints[hintIndex];
  const isInference = step === "inference" || step === "complete";

  return (
    <section className="space-y-5" aria-live="polite" aria-busy="true">
      <div className="card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="analysis-live-dot" aria-hidden />
          <h2 className="text-sm font-semibold">Running analysis</h2>
        </div>

        <AnalysisSourcePills activeStep={step} />

        <p className="text-muted mt-4 text-sm">{hint}</p>
        {isInference && (
          <p className="text-muted mt-2 text-sm">Building charts and trends…</p>
        )}
      </div>

      <ChartSkeletonGrid homeTeam={homeTeam} awayTeam={awayTeam} />
    </section>
  );
}

function ChartSkeletonGrid({
  homeTeam,
  awayTeam,
}: {
  homeTeam: string;
  awayTeam: string;
}) {
  const cards = [
    { title: "Win probabilities", subtitle: "Model vs market" },
    { title: "Form trend", subtitle: `${homeTeam} / ${awayTeam}` },
    { title: "Key factors", subtitle: "Weighted drivers" },
    { title: "Head-to-head", subtitle: "Recent meetings" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="card analysis-skeleton-card overflow-hidden p-5"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <div className="mb-4">
            <p className="label mb-1">{card.title}</p>
            <p className="text-muted text-xs">{card.subtitle}</p>
          </div>
          <div className="space-y-3">
            <div className="analysis-shimmer h-3 w-4/5 rounded-full" />
            <div className="analysis-shimmer h-3 w-full rounded-full" />
            <div className="analysis-shimmer h-3 w-11/12 rounded-full" />
            <div className="mt-5 flex items-end gap-2">
              {[40, 64, 48, 72, 56].map((height, barIndex) => (
                <div
                  key={barIndex}
                  className="analysis-bar-pulse bg-accent/20 flex-1 rounded-t-md"
                  style={{
                    height: `${height}px`,
                    animationDelay: `${index * 100 + barIndex * 80}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}