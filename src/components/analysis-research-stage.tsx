"use client";

import { useEffect, useState } from "react";

import { AnalysisSourcePills } from "@/components/analysis-source-pills";
import { TeeVerifiedBadge } from "@/components/tee-verified-badge";
import type { AnalysisProgressStep } from "@/types/stream";

const STEP_HINTS: Record<AnalysisProgressStep, string[]> = {
  fixture: ["Resolving fixture details…", "Locking kickoff and venue…"],
  football: ["Pulling form, H2H, and injuries…", "Reading recent results…"],
  polymarket: ["Scanning Polymarket markets…", "Mapping crowd odds…"],
  weather: ["Checking venue weather…", "Factoring match-day conditions…"],
  inference: ["Running 0G analyst in TEE…", "Computing win probabilities…"],
  complete: ["Packaging charts…", "Almost there…"],
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
    }, 2600);
    return () => window.clearInterval(interval);
  }, [message, hints]);

  const hint = message ?? hints[hintIndex];
  const isInference = step === "inference" || step === "complete";

  return (
    <section className="animate-fade-up space-y-5" aria-live="polite" aria-busy="true">
      <div className="card overflow-hidden p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="analysis-orb bg-accent/20 text-accent flex h-10 w-10 items-center justify-center rounded-2xl text-lg ring-1 ring-accent/25">
              ⚽
            </span>
            <div>
              <p className="label mb-0.5">In progress</p>
              <h2 className="font-display text-lg font-bold">Building your analysis</h2>
            </div>
          </div>
          {isInference && <TeeVerifiedBadge size="md" />}
        </div>

        <div className="analysis-progress-bar mb-5" />

        <AnalysisSourcePills activeStep={step} />

        <p className="text-muted mt-4 text-sm">{hint}</p>
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
          className="card analysis-skeleton-card p-5"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="mb-4">
            <p className="label mb-1">{card.title}</p>
            <p className="text-muted text-xs">{card.subtitle}</p>
          </div>
          <div className="space-y-3">
            <div className="analysis-shimmer h-2.5 w-4/5 rounded-full" />
            <div className="analysis-shimmer h-2.5 w-full rounded-full" />
            <div className="analysis-shimmer mt-6 h-24 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}