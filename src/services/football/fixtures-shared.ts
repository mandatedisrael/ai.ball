import { normalizeTeamSummary } from "@/lib/team-display";
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

export const LIVE_STATUSES = new Set([
  "LIVE",
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "INT",
]);

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO", "ABD", "CANC"]);

const UPCOMING_STATUSES = new Set(["NS", "TBD"]);

function fixtureSortTier(fixture: FixtureSummary): number {
  if (LIVE_STATUSES.has(fixture.status)) return 0;
  if (UPCOMING_STATUSES.has(fixture.status)) return 1;
  if (FINISHED_STATUSES.has(fixture.status)) return 3;
  return 2;
}

export function mapFixture(item: ApiFootballFixture): FixtureSummary {
  return {
    id: item.fixture.id,
    date: item.fixture.date,
    league: {
      id: item.league.id,
      name: item.league.name,
      country: item.league.country,
      logo: item.league.logo,
    },
    homeTeam: normalizeTeamSummary({
      id: item.teams.home.id,
      name: item.teams.home.name,
      logo: item.teams.home.logo,
    }),
    awayTeam: normalizeTeamSummary({
      id: item.teams.away.id,
      name: item.teams.away.name,
      logo: item.teams.away.logo,
    }),
    venue: item.fixture.venue?.name,
    status: item.fixture.status.short,
  };
}

export async function fetchFixturesByLeague(
  leagueId: number,
  season: number,
  from?: string,
  to?: string,
): Promise<FixtureSummary[]> {
  const params: Record<string, string | number> = {
    league: leagueId,
    season,
  };

  if (from) params.from = from;
  if (to) params.to = to;

  const data = await footballFetch<FixturesResponse>("/fixtures", params);
  return data.response.map(mapFixture);
}

export async function fetchFixturesByDate(
  date: string,
): Promise<FixtureSummary[]> {
  const data = await footballFetch<FixturesResponse>("/fixtures", {
    date,
    timezone: "UTC",
  });

  return data.response.map(mapFixture);
}

export async function fetchLiveFixtures(
  leagueId?: number,
): Promise<FixtureSummary[]> {
  const data = await footballFetch<FixturesResponse>("/fixtures", {
    live: "all",
  });

  let fixtures = data.response.map(mapFixture);
  if (leagueId) {
    fixtures = fixtures.filter((fixture) => fixture.league.id === leagueId);
  }

  return fixtures;
}

export function dedupeFixtures(fixtures: FixtureSummary[]): FixtureSummary[] {
  const byId = new Map<number, FixtureSummary>();
  for (const fixture of fixtures) {
    byId.set(fixture.id, fixture);
  }
  return [...byId.values()];
}

export function sortFixtures(fixtures: FixtureSummary[]): FixtureSummary[] {
  return fixtures.sort((a, b) => {
    const aTier = fixtureSortTier(a);
    const bTier = fixtureSortTier(b);
    if (aTier !== bTier) return aTier - bTier;

    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();

    if (aTier === 3) return bTime - aTime;
    return aTime - bTime;
  });
}

export function pickClosestTeamFixture(
  fixtures: FixtureSummary[],
  teamId: number,
): FixtureSummary | null {
  const teamFixtures = fixtures.filter(
    (fixture) =>
      fixture.homeTeam.id === teamId || fixture.awayTeam.id === teamId,
  );

  if (teamFixtures.length === 0) return null;

  const live = teamFixtures.find((fixture) => LIVE_STATUSES.has(fixture.status));
  if (live) return live;

  const now = Date.now();
  const upcoming = teamFixtures
    .filter((fixture) => !FINISHED_STATUSES.has(fixture.status))
    .filter((fixture) => new Date(fixture.date).getTime() >= now - 2 * 60 * 60 * 1000)
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

  if (upcoming[0]) return upcoming[0];

  const recent = teamFixtures
    .filter((fixture) => FINISHED_STATUSES.has(fixture.status))
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

  return recent[0] ?? null;
}