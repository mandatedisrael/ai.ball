import type { MatchDataBundle } from "@/types/fixture";
import type { FixtureSummary } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

export const DEMO_FIXTURES: FixtureSummary[] = [
  {
    id: 1001,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
    },
    homeTeam: { id: 42, name: "Arsenal" },
    awayTeam: { id: 49, name: "Chelsea" },
    venue: "Emirates Stadium",
    status: "NS",
  },
  {
    id: 1002,
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    league: {
      id: 140,
      name: "La Liga",
      country: "Spain",
    },
    homeTeam: { id: 541, name: "Real Madrid" },
    awayTeam: { id: 529, name: "Barcelona" },
    venue: "Santiago Bernabéu",
    status: "NS",
  },
  {
    id: 1003,
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    league: {
      id: 2,
      name: "UEFA Champions League",
      country: "World",
    },
    homeTeam: { id: 50, name: "Manchester City" },
    awayTeam: { id: 85, name: "Paris Saint Germain" },
    venue: "Etihad Stadium",
    status: "NS",
  },
];

export function getDemoMatchData(fixture: FixtureSummary): MatchDataBundle {
  return {
    fixture,
    homeForm: {
      played: 5,
      wins: 4,
      draws: 1,
      losses: 0,
      goalsFor: 11,
      goalsAgainst: 4,
      results: ["W", "W", "D", "W", "W"],
    },
    awayForm: {
      played: 5,
      wins: 3,
      draws: 1,
      losses: 1,
      goalsFor: 9,
      goalsAgainst: 7,
      results: ["W", "L", "W", "D", "W"],
    },
    headToHead: [
      {
        date: "2025-10-12",
        homeTeam: fixture.homeTeam.name,
        awayTeam: fixture.awayTeam.name,
        homeGoals: 2,
        awayGoals: 1,
      },
      {
        date: "2025-04-08",
        homeTeam: fixture.awayTeam.name,
        awayTeam: fixture.homeTeam.name,
        homeGoals: 1,
        awayGoals: 1,
      },
    ],
    injuries: [
      {
        team: fixture.homeTeam.name,
        player: "Key Midfielder",
        reason: "Muscle",
        type: "Doubtful",
      },
      {
        team: fixture.awayTeam.name,
        player: "Starting Full-back",
        reason: "Knee",
        type: "Out",
      },
    ],
    standings: [
      {
        team: fixture.homeTeam.name,
        rank: 2,
        points: 58,
        played: 28,
        goalDiff: 28,
      },
      {
        team: fixture.awayTeam.name,
        rank: 4,
        points: 52,
        played: 28,
        goalDiff: 14,
      },
    ],
    weather: {
      description: "Partly cloudy",
      temperatureC: 12,
      windKph: 14,
      humidity: 62,
    },
  };
}

export function getDemoPolymarket(
  fixture: FixtureSummary,
): PolymarketMarketContext {
  return {
    found: true,
    slug: `${fixture.homeTeam.name.toLowerCase().replace(/\s+/g, "-")}-vs-${fixture.awayTeam.name.toLowerCase().replace(/\s+/g, "-")}`,
    title: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
    marketType: "match_winner",
    volumeUsd: 38400,
    liquidityUsd: 12200,
    outcomes: [
      { label: "Home Win", price: 0.52, impliedProbability: 0.52 },
      { label: "Draw", price: 0.28, impliedProbability: 0.28 },
      { label: "Away Win", price: 0.2, impliedProbability: 0.2 },
    ],
    fetchedAt: new Date().toISOString(),
    url: "https://polymarket.com/sports",
    lowLiquidity: false,
  };
}