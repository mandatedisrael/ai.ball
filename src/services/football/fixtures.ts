import { WORLD_CUP_LEAGUE_ID } from "@/lib/leagues";
import type { FixtureSummary } from "@/types/fixture";
import { footballFetch } from "@/services/football/client";

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

const LIVE_STATUSES = new Set([
  "LIVE",
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "INT",
]);

function mapFixture(item: ApiFootballFixture): FixtureSummary {
  return {
    id: item.fixture.id,
    date: item.fixture.date,
    league: {
      id: item.league.id,
      name: item.league.name,
      country: item.league.country,
      logo: item.league.logo,
    },
    homeTeam: {
      id: item.teams.home.id,
      name: item.teams.home.name,
      logo: item.teams.home.logo,
    },
    awayTeam: {
      id: item.teams.away.id,
      name: item.teams.away.name,
      logo: item.teams.away.logo,
    },
    venue: item.fixture.venue?.name,
    status: item.fixture.status.short,
  };
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

async function fetchFixturesByDate(date: string): Promise<FixtureSummary[]> {
  const data = await footballFetch<FixturesResponse>("/fixtures", {
    date,
    timezone: "UTC",
  });

  return data.response.map(mapFixture);
}

async function fetchLiveFixtures(leagueId?: number): Promise<FixtureSummary[]> {
  const data = await footballFetch<FixturesResponse>("/fixtures", {
    live: "all",
  });

  let fixtures = data.response.map(mapFixture);
  if (leagueId) {
    fixtures = fixtures.filter((fixture) => fixture.league.id === leagueId);
  }

  return fixtures;
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

function dedupeFixtures(fixtures: FixtureSummary[]): FixtureSummary[] {
  const byId = new Map<number, FixtureSummary>();
  for (const fixture of fixtures) {
    byId.set(fixture.id, fixture);
  }
  return [...byId.values()];
}

function sortFixtures(fixtures: FixtureSummary[]): FixtureSummary[] {
  return fixtures.sort((a, b) => {
    const aLive = LIVE_STATUSES.has(a.status) ? 0 : 1;
    const bLive = LIVE_STATUSES.has(b.status) ? 0 : 1;
    if (aLive !== bLive) return aLive - bLive;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
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

export async function searchFixtures(options: {
  query?: string;
  leagueId?: number;
  days?: number;
}): Promise<FixtureSummary[]> {
  const days = options.days ?? 14;
  const from = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const defaultToWorldCup = !options.query && !options.leagueId;
  const leagueFilter = options.leagueId
    ?? (defaultToWorldCup ? WORLD_CUP_LEAGUE_ID : undefined);

  const [liveFixtures, rangedFixtures] = await Promise.all([
    fetchLiveFixtures(leagueFilter).catch(() => []),
    fetchFixturesInRange(from, to, leagueFilter).catch(() => []),
  ]);

  const merged = dedupeFixtures([...liveFixtures, ...rangedFixtures]);
  return filterFixtures(merged, options.query, leagueFilter);
}

export async function getFixtureById(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  const data = await footballFetch<FixturesResponse>("/fixtures", {
    id: fixtureId,
  });

  const item = data.response[0];
  return item ? mapFixture(item) : null;
}