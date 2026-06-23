import { hasZerogCompute } from "@/lib/env";
import {
  buildComparisons,
  normalizeProbabilities,
} from "@/lib/probability";
import { getFixtureById } from "@/services/football/fixtures";
import { buildMatchDataBundle } from "@/services/football/match-data";
import { resolvePolymarketMarket } from "@/services/polymarket/markets";
import { fetchWeatherForVenue } from "@/services/weather/openweather";
import {
  runDemoAnalysis,
  runZerogAnalysis,
} from "@/services/zerog/compute";
import type { AnalysisResult } from "@/types/analysis";

export async function analyzeFixture(
  fixtureId: number,
): Promise<AnalysisResult> {
  const fixture = await getFixtureById(fixtureId);
  if (!fixture) {
    throw new Error(`Fixture ${fixtureId} not found`);
  }

  const [matchData, polymarket] = await Promise.all([
    buildMatchDataBundle(fixture),
    resolvePolymarketMarket(fixture),
  ]);

  if (fixture.venue) {
    matchData.weather = await fetchWeatherForVenue(fixture.venue);
  }

  const analystOutput = hasZerogCompute()
    ? await runZerogAnalysis(matchData, polymarket)
    : runDemoAnalysis(matchData, polymarket);

  const probabilities = normalizeProbabilities(analystOutput.probabilities);

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
    source: hasZerogCompute() ? "0g-compute" : "demo",
  };
}