import type { MatchDataBundle } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

export const ANALYST_SYSTEM_PROMPT = `You are Match Analyst, a professional football (soccer) research assistant for prediction-market traders.

Rules:
- Use ONLY the structured match data provided. Never invent stats, injuries, or results.
- Output neutral, data-driven analysis. This is research, not betting advice.
- Probabilities must reflect the evidence and sum to approximately 1.0.
- Be conversational but concise. Mention the most important 3-5 factors.
- If data is missing, lower confidence and note the gap in risks.
- Respond with valid JSON matching the required schema exactly.`;

export function buildAnalystUserPrompt(
  data: MatchDataBundle,
  polymarket?: PolymarketMarketContext,
): string {
  const polySection = polymarket?.found
    ? `
POLYMARKET CONTEXT (for comparison only — do not anchor blindly):
Market: ${polymarket.title ?? "Unknown"}
Outcomes: ${polymarket.outcomes
        .map((o) => `${o.label} ${(o.impliedProbability * 100).toFixed(0)}%`)
        .join(" | ")}
Volume: ${polymarket.volumeUsd ? `$${polymarket.volumeUsd.toLocaleString()}` : "unknown"}
`
    : "POLYMARKET CONTEXT: No active market found for this fixture.";

  return `Analyze this upcoming fixture and return JSON with:
probabilities (home/draw/away as 0-1 decimals), confidence (low|medium|high),
narrative (2-4 sentences), key_factors (array), risks (array), trading_insight (1-2 sentences on model vs market if market exists).

FIXTURE:
${data.fixture.homeTeam.name} vs ${data.fixture.awayTeam.name}
League: ${data.fixture.league.name}
Kickoff: ${data.fixture.date}
Venue: ${data.fixture.venue ?? "TBD"}

HOME FORM (last ${data.homeForm.played}):
Results: ${data.homeForm.results.join(" ")} | GF ${data.homeForm.goalsFor} GA ${data.homeForm.goalsAgainst}

AWAY FORM (last ${data.awayForm.played}):
Results: ${data.awayForm.results.join(" ")} | GF ${data.awayForm.goalsFor} GA ${data.awayForm.goalsAgainst}

HEAD-TO-HEAD (recent):
${data.headToHead
    .slice(0, 5)
    .map(
      (m) =>
        `${m.date}: ${m.homeTeam} ${m.homeGoals}-${m.awayGoals} ${m.awayTeam}`,
    )
    .join("\n") || "No recent H2H data"}

STANDINGS:
${data.standings
    .map(
      (s) =>
        `${s.team}: ${s.rank}th, ${s.points} pts, GD ${s.goalDiff > 0 ? "+" : ""}${s.goalDiff}`,
    )
    .join("\n")}

INJURIES / ABSENCES:
${
  data.injuries.length
    ? data.injuries
        .map((i) => `${i.team}: ${i.player} (${i.type} — ${i.reason})`)
        .join("\n")
    : "None reported"
}

WEATHER:
${
  data.weather
    ? `${data.weather.description}, ${data.weather.temperatureC}°C, wind ${data.weather.windKph} km/h`
    : "Not available"
}
${polySection}`;
}