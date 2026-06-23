import { hasZerogCompute } from "@/lib/env";
import {
  buildComparisons,
  normalizeProbabilities,
} from "@/lib/probability";
import { getFixtureById } from "@/services/football/fixtures";
import { buildMatchDataBundle } from "@/services/football/match-data";
import { resolvePolymarketMarket } from "@/services/polymarket/markets";
import { fetchWeatherForVenue } from "@/services/weather/openweather";
import { runZerogAnalysis } from "@/services/zerog/compute";
import type { AnalysisResult } from "@/types/analysis";
import type { FixtureSummary } from "@/types/fixture";
import type { AnalysisProgressStep } from "@/types/stream";

export type ProgressCallback = (
  step: AnalysisProgressStep,
  message: string,
) => void;

export async function analyzeFixture(
  fixtureId: number,
  onProgress?: ProgressCallback,
  knownFixture?: FixtureSummary,
): Promise<AnalysisResult> {
  if (!hasZerogCompute()) {
    throw new Error("0G Compute is not configured. Set ZEROG_ROUTER_API_KEY.");
  }

  onProgress?.("fixture", "Resolving fixture…");
  const fixture =
    knownFixture && knownFixture.id === fixtureId
      ? knownFixture
      : await getFixtureById(fixtureId);
  if (!fixture) {
    throw new Error(`Fixture ${fixtureId} not found`);
  }

  onProgress?.("football", "Fetching form, H2H, injuries, and standings…");
  const matchData = await buildMatchDataBundle(fixture);

  onProgress?.("polymarket", "Checking Polymarket for market context…");
  const polymarket = await resolvePolymarketMarket(fixture);

  if (fixture.venue) {
    onProgress?.("weather", "Loading venue weather context…");
    matchData.weather = await fetchWeatherForVenue(fixture.venue);
  }

  onProgress?.("inference", "Running 0G AI analyst…");

  const analystOutput = await runZerogAnalysis(matchData, polymarket);
  const probabilities = normalizeProbabilities(analystOutput.probabilities);

  onProgress?.("complete", "Analysis complete.");

  return {
    fixtureId,
    probabilities,
    confidence: analystOutput.confidence,
    narrative: analystOutput.narrative,
    keyFactors: analystOutput.key_factors,
    risks: analystOutput.risks,
    tradingInsight: analystOutput.trading_insight,
    comparisons: buildComparisons(probabilities, polymarket),
    matchData,
    polymarket: polymarket.found ? polymarket : undefined,
    analyzedAt: new Date().toISOString(),
    source: "0g-compute",
    teeVerified: true,
  };
}