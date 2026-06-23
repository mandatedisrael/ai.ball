"use client";

import { AnalysisSourcePills } from "@/components/analysis-source-pills";
import { FactorChart } from "@/components/charts/factor-chart";
import { FormTrendChart } from "@/components/charts/form-trend-chart";
import { H2HChart } from "@/components/charts/h2h-chart";
import { ProbabilityChart } from "@/components/charts/probability-chart";
import { TeeVerifiedBadge, TeeVerifiedCallout } from "@/components/tee-verified-badge";
import { formatDelta, formatPercent } from "@/lib/probability";
import { isTeeVerified } from "@/lib/tee-verified";
import type { AnalysisResult } from "@/types/analysis";
import type { PolymarketMarketContext } from "@/types/polymarket";

interface AnalysisResultsPanelProps {
  result: AnalysisResult;
  market?: PolymarketMarketContext | null;
  volatility: string;
  onSave: () => void;
  isSaving: boolean;
  saveMessage: string | null;
}

export function AnalysisResultsPanel({
  result,
  market,
  volatility,
  onSave,
  isSaving,
  saveMessage,
}: AnalysisResultsPanelProps) {
  const largestGap = result.comparisons
    .filter((c) => c.delta !== undefined)
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))[0];

  const winProb = (
    Math.max(result.probabilities.home, result.probabilities.away) * 100
  ).toFixed(1);
  const teeVerified = isTeeVerified(result);

  return (
    <section className="space-y-5">
      <div className="card p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-positive h-2 w-2 rounded-full" aria-hidden />
            <h2 className="font-display text-base font-bold">Analysis complete</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-surface-elevated text-muted rounded-full px-3 py-1 font-mono text-xs font-medium">
              0G AI
            </span>
            {teeVerified && <TeeVerifiedBadge size="md" />}
          </div>
        </div>

        <AnalysisSourcePills complete />

        {teeVerified && <TeeVerifiedCallout className="mt-5" />}

        <div className="mt-5">
          <ProbabilityChart comparisons={result.comparisons} embedded />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-lg">
          <MetricTile label="Win prob" value={`${winProb}%`} />
          <MetricTile label="Volatility" value={volatility} />
          <MetricTile label="Confidence" value={result.confidence} />
        </div>

        <p className="mt-6 text-sm leading-7 text-foreground/90">
          {result.narrative}
        </p>

        {result.polymarket?.found && (
          <p className="text-muted mt-4 rounded-xl bg-surface-elevated/80 px-4 py-3 text-sm leading-6">
            Polymarket prices this fixture around{" "}
            {result.comparisons
              .filter((c) => c.polymarket !== undefined)
              .map((c) => `${c.label} ${formatPercent(c.polymarket ?? 0)}`)
              .join(" · ")}
            .
          </p>
        )}

        <div className="mt-6">
          <p className="label mb-3">Key factors</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {result.keyFactors.map((factor) => (
              <li
                key={`${factor.factor}-${factor.detail}`}
                className="rounded-xl border border-border bg-surface-elevated/50 px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{factor.factor}</span>
                  <span className="text-accent font-mono text-xs">
                    {(factor.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-muted mt-1 text-xs leading-5">{factor.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface-elevated/40 p-4">
          <p className="label mb-2">Trading insight</p>
          <p className="text-sm leading-7 text-foreground/90">
            {result.tradingInsight}
          </p>
          {largestGap && largestGap.delta !== undefined && (
            <p className="text-muted mt-3 text-xs leading-5">
              Largest divergence — {largestGap.label}: model{" "}
              {formatPercent(largestGap.model)} vs market{" "}
              {formatPercent(largestGap.polymarket ?? 0)} (
              {formatDelta(largestGap.delta)})
            </p>
          )}
        </div>

        {result.risks.length > 0 && (
          <ul className="text-muted mt-4 list-disc space-y-1 pl-5 text-sm leading-6">
            {result.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="btn-primary disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save analysis"}
          </button>
          {result.polymarket?.url && (
            <a
              href={result.polymarket.url}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost px-5 py-2.5 text-sm font-medium"
            >
              View on Polymarket ↗
            </a>
          )}
        </div>

        {saveMessage && (
          <p className="text-positive mt-3 text-sm">{saveMessage}</p>
        )}
      </div>

      {market?.found && market.outcomes[0] && (
        <div className="card flex items-center justify-between p-5">
          <div>
            <p className="label mb-1">Polymarket odds</p>
            <p className="font-medium">{market.outcomes[0].label}</p>
          </div>
          <p className="text-accent font-mono text-2xl font-bold">
            ${market.outcomes[0].price.toFixed(2)}
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <FormTrendChart
          homeTeam={result.matchData.fixture.homeTeam.name}
          awayTeam={result.matchData.fixture.awayTeam.name}
          homeForm={result.matchData.homeForm}
          awayForm={result.matchData.awayForm}
        />
        <FactorChart factors={result.keyFactors} />
        <H2HChart
          matches={result.matchData.headToHead}
          homeTeam={result.matchData.fixture.homeTeam.name}
          awayTeam={result.matchData.fixture.awayTeam.name}
        />
      </div>
    </section>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-3 text-center">
      <p className="label mb-1">{label}</p>
      <p className="text-lg font-bold capitalize">{value}</p>
    </div>
  );
}