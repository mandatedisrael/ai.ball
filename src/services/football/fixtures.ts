import { DEMO_FIXTURES } from "@/lib/demo-data";
import { SUPPORTED_LEAGUES } from "@/lib/leagues";
import { hasApiFootball } from "@/lib/env";
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

async function fetchLeagueFixtures(
  leagueId: number,
  from: string,
  to: string,
  season: number,
): Promise<FixtureSummary[]> {
  const data = await footballFetch<FixturesResponse>("/fixtures", {
    league: leagueId,
    season,
    from,
    to,
    timezone: "UTC",
    status: "NS",
  });

  return data.response.map(mapFixture);
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

  return filtered
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 40);
}

export async function searchFixtures(options: {
  query?: string;
  leagueId?: number;
  days?: number;
}): Promise<FixtureSummary[]> {
  if (!hasApiFootball()) {
    return filterFixtures(DEMO_FIXTURES, options.query, options.leagueId);
  }

  const days = options.days ?? 7;
  const from = new Date().toISOString().slice(0, 10);
  const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const season = new Date().getFullYear();

  const leagueIds = options.leagueId
    ? [options.leagueId]
    : SUPPORTED_LEAGUES.map((league) => league.id);

  const batches = await Promise.all(
    leagueIds.map((leagueId) =>
      fetchLeagueFixtures(leagueId, from, to, season).catch(() => []),
    ),
  );

  return filterFixtures(batches.flat(), options.query, options.leagueId);
}

export async function getFixtureById(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  if (!hasApiFootball()) {
    return DEMO_FIXTURES.find((f) => f.id === fixtureId) ?? null;
  }

  const data = await footballFetch<FixturesResponse>("/fixtures", {
    id: fixtureId,
  });

  const item = data.response[0];
  return item ? mapFixture(item) : null;
}