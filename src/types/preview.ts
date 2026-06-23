import type { ConfidenceLevel } from "@/types/analysis";

export type VolatilityLevel = "LOW" | "MED" | "HIGH";

export interface MatchPreview {
  winProbability: number;
  volatility: VolatilityLevel;
  confidence: ConfidenceLevel;
  insightTeaser: string;
  favoredSide: "home" | "away" | "draw";
}