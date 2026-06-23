import type { MatchPreview, VolatilityLevel } from "@/types/preview";
import type { ConfidenceLevel } from "@/types/analysis";
import type { FixtureSummary } from "@/types/fixture";

function hashFixture(id: number): number {
  return ((id * 9301 + 49297) % 233280) / 233280;
}

function toVolatility(value: number): VolatilityLevel {
  if (value < 0.33) return "LOW";
  if (value < 0.66) return "MED";
  return "HIGH";
}

function toConfidence(value: number): ConfidenceLevel {
  if (value < 0.35) return "low";
  if (value < 0.7) return "medium";
  return "high";
}

function formatConfidence(level: ConfidenceLevel): string {
  return level.toUpperCase();
}

export function buildMatchPreview(fixture: FixtureSummary): MatchPreview {
  const h = hashFixture(fixture.id);
  const h2 = hashFixture(fixture.id + fixture.homeTeam.id);

  const homeBias = 0.38 + h * 0.28;
  const awayBias = 1 - homeBias - 0.24;
  const favoredSide =
    homeBias >= awayBias ? "home" : awayBias > homeBias ? "away" : "draw";
  const winProbability = Math.max(homeBias, awayBias) * 100;

  const isKnockout =
    fixture.league.name.includes("Champions") ||
    fixture.league.name.includes("World Cup");
  const isLive = fixture.status === "LIVE" || fixture.status === "1H" || fixture.status === "2H";

  const teasers = [
    `AI detects balanced momentum. Expected goals trending around ${(1.8 + h2 * 1.2).toFixed(1)}. Historical meetings remain tight.`,
    `AI detects heavy central pressure. xG trending above ${(2 + h * 1.4).toFixed(1)}. Head-to-head favors the home side in knockout stages.`,
    `Model sees open transitions. Both sides averaging ${(1.2 + h2).toFixed(1)} goals per game in recent fixtures.`,
    `Tempo and pressing intensity skew toward the favorite. Table position adds motivation this week.`,
  ];

  const insightTeaser = isKnockout
    ? teasers[1]
    : isLive
      ? teasers[0]
      : teasers[Math.floor(h * teasers.length)];

  return {
    winProbability: Number(winProbability.toFixed(1)),
    volatility: toVolatility(h2),
    confidence: toConfidence(1 - h * 0.4),
    insightTeaser,
    favoredSide,
  };
}

export function formatConfidenceLabel(level: ConfidenceLevel): string {
  return formatConfidence(level);
}

export function formatVolatilityLabel(level: VolatilityLevel): string {
  return level;
}

export function isFixtureLive(fixture: FixtureSummary): boolean {
  return ["LIVE", "1H", "2H", "HT", "ET", "P"].includes(fixture.status);
}

export function isFixtureUpcoming(fixture: FixtureSummary): boolean {
  return fixture.status === "NS" || fixture.status === "TBD";
}