import { DEMO_FIXTURES } from "@/lib/demo-data";
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

export async function searchFixtures(options: {
  query?: string;
  leagueId?: number;
  days?: number;
}): Promise<FixtureSummary[]> {
  if (!hasApiFootball()) {
    const query = options.query?.toLowerCase() ?? "";
    return DEMO_FIXTURES.filter((fixture) => {
      if (!query) return true;
      return (
        fixture.homeTeam.name.toLowerCase().includes(query) ||
        fixture.awayTeam.name.toLowerCase().includes(query) ||
        fixture.league.name.toLowerCase().includes(query)
      );
    });
  }

  const days = options.days ?? 7;
  const from = new Date().toISOString().slice(0, 10);
  const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const data = await footballFetch<FixturesResponse>("/fixtures", {
    league: options.leagueId,
    from,
    to,
    timezone: "UTC",
    status: "NS",
  });

  let fixtures = data.response.map(mapFixture);

  if (options.query) {
    const q = options.query.toLowerCase();
    fixtures = fixtures.filter(
      (f) =>
        f.homeTeam.name.toLowerCase().includes(q) ||
        f.awayTeam.name.toLowerCase().includes(q),
    );
  }

  return fixtures.slice(0, 30);
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