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

const IMPACT_VALUES = ["positive", "negative", "neutral"] as const;

function normalizeImpact(value: unknown) {
  return typeof value === "string" &&
    IMPACT_VALUES.includes(value as (typeof IMPACT_VALUES)[number])
    ? value
    : "neutral";
}

function normalizeKeyFactor(item: unknown, index: number, total: number) {
  if (typeof item === "string") {
    const trimmed = item.trim();
    return {
      factor: trimmed.length > 72 ? `${trimmed.slice(0, 69)}…` : trimmed,
      impact: "neutral" as const,
      weight: Math.min(1, Math.max(0.1, 1 / Math.max(total, 1))),
      detail: trimmed,
    };
  }

  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;
    const detail = String(obj.detail ?? obj.description ?? obj.factor ?? obj.name ?? "");
    const factor = String(obj.factor ?? obj.name ?? `Factor ${index + 1}`);
    const weight =
      typeof obj.weight === "number"
        ? obj.weight
        : Math.min(1, Math.max(0.1, 1 / Math.max(total, 1)));

    return {
      factor,
      impact: normalizeImpact(obj.impact),
      weight,
      detail: detail || factor,
    };
  }

  return item;
}

const keyFactorsSchema = z.preprocess(
  (value) => {
    if (!Array.isArray(value)) return value;
    return value.map((item, index) =>
      normalizeKeyFactor(item, index, value.length),
    );
  },
  z.array(keyFactorSchema).min(2).max(8),
);

export const analystOutputSchema = z.object({
  probabilities: probabilityTripleSchema,
  confidence: z.enum(["low", "medium", "high"]),
  narrative: z.string().min(40),
  key_factors: keyFactorsSchema,
  risks: z.array(z.string()).min(1).max(6),
  trading_insight: z.string().min(20),
});

export type AnalystOutput = z.infer<typeof analystOutputSchema>;

export const fixtureSummarySchema = z.object({
  id: z.number().int().positive(),
  date: z.string(),
  league: z.object({
    id: z.number().int(),
    name: z.string(),
    country: z.string(),
    logo: z.string().optional(),
  }),
  homeTeam: z.object({
    id: z.number().int(),
    name: z.string(),
    logo: z.string().optional(),
  }),
  awayTeam: z.object({
    id: z.number().int(),
    name: z.string(),
    logo: z.string().optional(),
  }),
  venue: z.string().optional(),
  status: z.string(),
});

export const analyzeRequestSchema = z.object({
  fixtureId: z.number().int().positive(),
  fixture: fixtureSummarySchema.optional(),
});

export const fixtureSearchSchema = z.object({
  query: z.string().trim().min(2).max(80).optional(),
  leagueId: z.coerce.number().int().positive().optional(),
  days: z.coerce.number().int().min(1).max(30).default(14),
});