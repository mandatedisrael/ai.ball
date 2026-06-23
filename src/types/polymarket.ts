export type MarketType = "match_winner" | "btts" | "over_under";

export interface PolymarketOutcome {
  label: string;
  price: number;
  impliedProbability: number;
}

export interface PolymarketMarketContext {
  found: boolean;
  slug?: string;
  title?: string;
  marketType: MarketType;
  volumeUsd?: number;
  liquidityUsd?: number;
  outcomes: PolymarketOutcome[];
  fetchedAt: string;
  url?: string;
  lowLiquidity?: boolean;
}