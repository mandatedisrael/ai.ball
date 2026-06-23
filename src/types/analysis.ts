import type { MatchDataBundle } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface ProbabilityTriple {
  home: number;
  draw: number;
  away: number;
}

export interface KeyFactor {
  factor: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  detail: string;
}

export interface ProbabilityComparison {
  outcome: "home" | "draw" | "away";
  label: string;
  model: number;
  polymarket?: number;
  delta?: number;
}

export interface AnalysisResult {
  fixtureId: number;
  probabilities: ProbabilityTriple;
  confidence: ConfidenceLevel;
  narrative: string;
  keyFactors: KeyFactor[];
  risks: string[];
  tradingInsight: string;
  comparisons: ProbabilityComparison[];
  matchData: MatchDataBundle;
  polymarket?: PolymarketMarketContext;
  analyzedAt: string;
  source: "0g-compute" | "demo";
}

export interface SavedAnalysis {
  id: string;
  result: AnalysisResult;
  polymarketSnapshot?: PolymarketMarketContext;
  savedAt: string;
}