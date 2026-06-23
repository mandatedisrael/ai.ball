import { z } from "zod";

export const probabilityTripleSchema = z.object({
  home: z.number().min(0).max(1),
  draw: z.number().min(0).max(1),
  away: z.number().min(0).max(1),
});

export const keyFactorSchema = z.object({
  factor: z.string(),
  impact: z.enum(["positive", "negative", "neutral"]),
  weight: z.number().min(0).max(1),
  detail: z.string(),
});

export const analystOutputSchema = z.object({
  probabilities: probabilityTripleSchema,
  confidence: z.enum(["low", "medium", "high"]),
  narrative: z.string().min(40),
  key_factors: z.array(keyFactorSchema).min(2).max(8),
  risks: z.array(z.string()).min(1).max(6),
  trading_insight: z.string().min(20),
});

export type AnalystOutput = z.infer<typeof analystOutputSchema>;

export const analyzeRequestSchema = z.object({
  fixtureId: z.number().int().positive(),
});

export const fixtureSearchSchema = z.object({
  query: z.string().trim().min(2).max(80).optional(),
  leagueId: z.coerce.number().int().positive().optional(),
  days: z.coerce.number().int().min(1).max(14).default(7),
});