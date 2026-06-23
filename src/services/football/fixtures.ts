import { getSeasonForLeague, WORLD_CUP_LEAGUE_ID } from "@/lib/leagues";
import type { FixtureSummary } from "@/types/fixture";
import { footballFetch } from "@/services/football/client";

import {
  dedupeFixtures,
  fetchFixturesByDate,
  fetchFixturesByLeague,
  fetchLiveFixtures,
  mapFixture,
  sortFixtures,
} from "./fixtures-shared";
import {
  filterTeamFixtures,
  findTeamNextFixture,
  type TeamSpotlight,
} from "./teams";

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    venue?: { name?: string };
    status: { short: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo?: string;
  };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
}

interface FixturesResponse {
  response: ApiFootballFixture[];
}

function enumerateDates(from: string, to: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${from}T12:00:00Z`);
  const end = new Date(`${to}T12:00:00Z`);

  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

async function fetchFixturesInRange(
  from: string,
  to: string,
  leagueId?: number,
): Promise<FixtureSummary[]> {
  const dates = enumerateDates(from, to);
  const batches = await Promise.all(
    dates.map((date) => fetchFixturesByDate(date).catch(() => [])),
  );

  let fixtures = batches.flat();
  if (leagueId) {
    fixtures = fixtures.filter((fixture) => fixture.league.id === leagueId);
  }

  return fixtures;
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

export interface FixtureSearchResult {
  fixtures: FixtureSummary[];
  spotlight?: TeamSpotlight;
}

export async function searchFixtures(options: {
  query?: string;
  leagueId?: number;
  days?: number;
}): Promise<FixtureSearchResult> {
  const query = options.query?.trim();

  if (query && query.length >= 2) {
    const spotlight = await findTeamNextFixture(query);

    if (spotlight) {
      const teamFixtures = filterTeamFixtures(
        [spotlight.nextFixture],
        spotlight.team.id,
      );

      return {
        fixtures: teamFixtures,
        spotlight,
      };
    }

    const days = options.days ?? 14;
    const from = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const [liveFixtures, rangedFixtures] = await Promise.all([
      fetchLiveFixtures(),
      fetchFixturesInRange(from, to),
    ]);

    const merged = dedupeFixtures([...liveFixtures, ...rangedFixtures]);
    const fixtures = filterFixtures(merged, query);

    return { fixtures };
  }

  const days = options.days ?? 14;
  const from = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const defaultToWorldCup = !options.leagueId;
  const leagueFilter = options.leagueId
    ?? (defaultToWorldCup ? WORLD_CUP_LEAGUE_ID : undefined);

  const season = leagueFilter ? getSeasonForLeague(leagueFilter) : undefined;

  const [liveFixtures, leagueFixtures, rangedFixtures] = await Promise.all([
    fetchLiveFixtures(leagueFilter),
    leagueFilter && season
      ? fetchFixturesByLeague(leagueFilter, season, from, to)
      : Promise.resolve([]),
    fetchFixturesInRange(from, to, leagueFilter),
  ]);

  const merged = dedupeFixtures([
    ...liveFixtures,
    ...leagueFixtures,
    ...rangedFixtures,
  ]);
  const fixtures = filterFixtures(merged, undefined, leagueFilter);

  return { fixtures };
}

async function findFixtureInRecentDates(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  const dates: string[] = [];
  const cursor = new Date();
  cursor.setUTCDate(cursor.getUTCDate() - 30);

  for (let i = 0; i < 38; i += 1) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const [liveFixtures, datedFixtures] = await Promise.all([
    fetchLiveFixtures().catch(() => []),
    Promise.all(
      dates.map((date) => fetchFixturesByDate(date).catch(() => [])),
    ).then((batches) => batches.flat()),
  ]);

  const merged = dedupeFixtures([...liveFixtures, ...datedFixtures]);
  return merged.find((fixture) => fixture.id === fixtureId) ?? null;
}

export async function getFixtureById(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  try {
    const data = await footballFetch<FixturesResponse>(
      "/fixtures",
      { id: fixtureId },
      { cache: "no-store" },
    );

    const item = data.response[0];
    if (item) return mapFixture(item);
  } catch {
    // Fall back to the same date-scan strategy used by search.
  }

  return findFixtureInRecentDates(fixtureId);
}

export type { TeamSpotlight } from "./teams";