"use client";

import { useEffect, useState } from "react";

import { AnalysisSourcePills } from "@/components/analysis-source-pills";
import { TeeVerifiedBadge, TeeVerifiedCallout } from "@/components/tee-verified-badge";
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

        {isInference && <TeeVerifiedCallout className="mt-5" />}

        {isInference && (
          <ChartsSkeletonGrid homeTeam={homeTeam} awayTeam={awayTeam} />
        )}

        <p className="text-muted mt-4 text-sm">{hint}</p>
      </div>
    </section>
  );
}

const PROB_SKELETON_BARS: Array<[number, number]> = [
  [56, 38],
  [22, 14],
  [44, 28],
];

function ChartsSkeletonGrid({
  homeTeam,
  awayTeam,
}: {
  homeTeam: string;
  awayTeam: string;
}) {
  const secondary = [
    { title: "Form trend (points)", subtitle: `${homeTeam} / ${awayTeam}` },
    { title: "Factor weights", subtitle: "Weighted drivers" },
    { title: "Head-to-head goals", subtitle: "Recent meetings" },
  ];

  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-12 lg:gap-4">
      <div className="rounded-xl border border-border bg-surface-elevated/35 p-3 sm:p-4 lg:col-span-4">
        <p className="label mb-0.5">Probability comparison</p>
        <p className="text-muted mb-2 text-xs">AI model vs prediction market</p>
        <div className="flex h-44 items-end justify-center gap-4 px-2">
          {["Home", "Draw", "Away"].map((label, index) => {
            const [modelHeight, marketHeight] = PROB_SKELETON_BARS[index];
            return (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="flex items-end gap-1.5">
                  <div
                    className="analysis-shimmer w-5 rounded-t-md sm:w-6"
                    style={{ height: `${modelHeight}px` }}
                  />
                  <div
                    className="analysis-shimmer w-5 rounded-t-md opacity-70 sm:w-6"
                    style={{ height: `${marketHeight}px` }}
                  />
                </div>
                <span className="text-muted text-[10px]">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3 lg:gap-4">
        {secondary.map((card, index) => (
          <div
            key={card.title}
            className="rounded-xl border border-border bg-surface-elevated/35 p-3 sm:p-4 analysis-skeleton-card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <p className="label mb-0.5">{card.title}</p>
            <p className="text-muted mb-2 text-xs">{card.subtitle}</p>
            <div className="space-y-2">
              <div className="analysis-shimmer h-2 w-full rounded-full" />
              <div className="analysis-shimmer h-2 w-4/5 rounded-full" />
              <div className="analysis-shimmer h-2 w-full rounded-full" />
              <div className="analysis-shimmer h-2 w-3/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}