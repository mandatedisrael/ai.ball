import { getCompetitionCode, WORLD_CUP_LEAGUE_ID } from "@/lib/leagues";
import type { FixtureSummary } from "@/types/fixture";
import {
  dedupeFixtures,
  LIVE_STATUSES,
  sortFixtures,
} from "@/services/football/fixtures-shared";

import { footballDataFetch } from "./client";
import {
  mapFootballDataMatch,
  type FootballDataMatch,
} from "./mappers";
import {
  filterTeamFixtures,
  findFootballDataTeamNextFixture,
  type TeamSpotlight,
} from "./teams";

interface MatchesResponse {
  matches: FootballDataMatch[];
}

interface MatchResponse extends FootballDataMatch {}

function dateRange(daysBack: number, daysForward: number) {
  const from = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  const to = new Date(Date.now() + daysForward * 24 * 60 * 60 * 1000);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

async function fetchCompetitionMatches(
  competitionCode: string,
  from: string,
  to: string,
): Promise<FixtureSummary[]> {
  const data = await footballDataFetch<MatchesResponse>(
    `/competitions/${competitionCode}/matches`,
    { dateFrom: from, dateTo: to },
  );

  return data.matches.map(mapFootballDataMatch);
}

async function fetchLiveMatches(): Promise<FixtureSummary[]> {
  const data = await footballDataFetch<MatchesResponse>("/matches", {
    status: "LIVE",
  });
  return data.matches.map(mapFootballDataMatch);
}

function filterFixtures(
  fixtures: FixtureSummary[],
  query?: string,
  leagueId?: number,
): FixtureSummary[] {
  let filtered = fixtures;

  if (leagueId) {
    filtered = filtered.filter((fixture) => fixture.league.id === leagueId);
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (fixture) =>
        fixture.homeTeam.name.toLowerCase().includes(q) ||
        fixture.awayTeam.name.toLowerCase().includes(q) ||
        fixture.league.name.toLowerCase().includes(q),
    );
  }

  return sortFixtures(filtered).slice(0, 40);
}

export interface FootballDataSearchResult {
  fixtures: FixtureSummary[];
  spotlight?: TeamSpotlight;
}

export async function searchFootballDataFixtures(options: {
  query?: string;
  leagueId?: number;
  days?: number;
}): Promise<FootballDataSearchResult> {
  const query = options.query?.trim();

  if (query && query.length >= 2) {
    const spotlight = await findFootballDataTeamNextFixture(query);
    if (spotlight) {
      return {
        fixtures: filterTeamFixtures([spotlight.nextFixture], spotlight.team.id),
        spotlight,
      };
    }
  }

  const days = options.days ?? 14;
  const { dateFrom, dateTo } = dateRange(2, days);
  const leagueFilter = options.leagueId ?? WORLD_CUP_LEAGUE_ID;
  const competitionCode = getCompetitionCode(leagueFilter);

  const [liveFixtures, competitionFixtures] = await Promise.all([
    fetchLiveMatches(),
    competitionCode
      ? fetchCompetitionMatches(competitionCode, dateFrom, dateTo)
      : Promise.resolve([]),
  ]);

  const merged = dedupeFixtures([...liveFixtures, ...competitionFixtures]);
  const fixtures = filterFixtures(merged, query, leagueFilter);

  return { fixtures };
}

export async function getFootballDataFixtureById(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  try {
    const match = await footballDataFetch<MatchResponse>(
      `/matches/${fixtureId}`,
      {},
      { revalidate: false },
    );
    return mapFootballDataMatch(match);
  } catch {
    return null;
  }
}

export function isLiveStatus(status: string): boolean {
  return LIVE_STATUSES.has(status);
}