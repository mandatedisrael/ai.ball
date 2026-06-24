import type { ProbabilityComparison, ProbabilityTriple } from "@/types/analysis";
import type { PolymarketMarketContext } from "@/types/polymarket";

const OUTCOME_LABELS = {
  home: "Home Win",
  draw: "Draw",
  away: "Away Win",
} as const;

export function normalizeProbabilities(
  probabilities: ProbabilityTriple,
): ProbabilityTriple {
  const total = probabilities.home + probabilities.draw + probabilities.away;
  if (total <= 0) {
    return { home: 0.34, draw: 0.33, away: 0.33 };
  }

  return {
    home: probabilities.home / total,
    draw: probabilities.draw / total,
    away: probabilities.away / total,
  };
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

/** Use explicit draw when provided; otherwise treat the remainder as draw. */
export function resolveDrawProbability(
  home: number,
  away: number,
  draw?: number,
): number {
  if (draw != null && draw >= 0) return draw;
  return Math.max(0, 1 - home - away);
}

export function formatDelta(value?: number): string {
  if (value === undefined) return "—";
  const points = value * 100;
  const sign = points > 0 ? "+" : "";
  return `${sign}${points.toFixed(0)}%`;
}

export function buildComparisons(
  model: ProbabilityTriple,
  polymarket?: PolymarketMarketContext,
): ProbabilityComparison[] {
  const polyByLabel = new Map(
    polymarket?.outcomes.map((o) => [o.label.toLowerCase(), o.impliedProbability]) ??
      [],
  );

  const keys = ["home", "draw", "away"] as const;

  return keys.map((outcome) => {
    const modelValue = model[outcome];
    const polyKey = OUTCOME_LABELS[outcome].toLowerCase();
    const polymarketValue =
      polyByLabel.get(polyKey) ??
      polyByLabel.get(outcome) ??
      findPolyOutcome(polymarket, outcome);

    return {
      outcome,
      label: OUTCOME_LABELS[outcome],
      model: modelValue,
      polymarket: polymarketValue,
      delta:
        polymarketValue !== undefined
          ? modelValue - polymarketValue
          : undefined,
    };
  });
}

function findPolyOutcome(
  polymarket: PolymarketMarketContext | undefined,
  outcome: "home" | "draw" | "away",
): number | undefined {
  if (!polymarket?.outcomes.length) return undefined;

  const indexMap = { home: 0, draw: 1, away: 2 };
  const candidate = polymarket.outcomes[indexMap[outcome]];
  return candidate?.impliedProbability;
}