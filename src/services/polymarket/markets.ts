import { getDemoPolymarket } from "@/lib/demo-data";
import { hasApiFootball } from "@/lib/env";
import type { FixtureSummary } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";
import { gammaFetch } from "@/services/polymarket/client";

interface GammaMarket {
  id: string;
  question: string;
  slug: string;
  outcomes: string;
  outcomePrices: string;
  volume?: string;
  liquidity?: string;
  active?: boolean;
}

interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  markets?: GammaMarket[];
  volume?: number;
  liquidity?: number;
}

function parseOutcomes(market: GammaMarket) {
  const labels: string[] = JSON.parse(market.outcomes || "[]");
  const prices: string[] = JSON.parse(market.outcomePrices || "[]");

  return labels.map((label, index) => {
    const price = Number(prices[index] ?? 0);
    return {
      label,
      price,
      impliedProbability: price,
    };
  });
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function eventMatchesFixture(event: GammaEvent, fixture: FixtureSummary): boolean {
  const title = normalize(event.title);
  const home = normalize(fixture.homeTeam.name);
  const away = normalize(fixture.awayTeam.name);
  return title.includes(home) && title.includes(away);
}

function pickMatchWinnerMarket(markets: GammaMarket[] = []): GammaMarket | null {
  const winner = markets.find((m) => {
    const q = m.question.toLowerCase();
    return (
      q.includes("win") ||
      q.includes("winner") ||
      q.includes("match result")
    );
  });

  return winner ?? markets[0] ?? null;
}

export async function resolvePolymarketMarket(
  fixture: FixtureSummary,
): Promise<PolymarketMarketContext> {
  if (!hasApiFootball()) {
    return getDemoPolymarket(fixture);
  }

  try {
    const events = await gammaFetch<GammaEvent[]>("/events", {
      active: "true",
      closed: "false",
      limit: 100,
      tag: "soccer",
    });

    const matched = events.find((event) => eventMatchesFixture(event, fixture));
    if (!matched) {
      return {
        found: false,
        marketType: "match_winner",
        outcomes: [],
        fetchedAt: new Date().toISOString(),
      };
    }

    const market = pickMatchWinnerMarket(matched.markets);
    if (!market) {
      return {
        found: false,
        marketType: "match_winner",
        outcomes: [],
        fetchedAt: new Date().toISOString(),
      };
    }

    const volumeUsd = Number(market.volume ?? matched.volume ?? 0);
    const liquidityUsd = Number(market.liquidity ?? matched.liquidity ?? 0);

    return {
      found: true,
      slug: market.slug,
      title: market.question || matched.title,
      marketType: "match_winner",
      volumeUsd,
      liquidityUsd,
      outcomes: parseOutcomes(market),
      fetchedAt: new Date().toISOString(),
      url: `https://polymarket.com/event/${matched.slug}`,
      lowLiquidity: liquidityUsd > 0 && liquidityUsd < 5000,
    };
  } catch {
    return {
      found: false,
      marketType: "match_winner",
      outcomes: [],
      fetchedAt: new Date().toISOString(),
    };
  }
}