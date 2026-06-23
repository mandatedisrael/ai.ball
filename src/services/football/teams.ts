import type { FixtureSummary } from "@/types/fixture";
import { footballFetch } from "@/services/football/client";

import {
  dedupeFixtures,
  fetchFixturesByDate,
  fetchLiveFixtures,
  pickClosestTeamFixture,
  sortFixtures,
} from "./fixtures-shared";

export interface TeamSummary {
  id: number;
  name: string;
  country: string;
  logo?: string;
}

export interface TeamSpotlight {
  team: TeamSummary;
  nextFixture: FixtureSummary;
}

interface TeamsResponse {
  response: Array<{
    team: {
      id: number;
      name: string;
      country: string;
      logo?: string;
    };
  }>;
}

export async function searchTeams(query: string): Promise<TeamSummary[]> {
  const data = await footballFetch<TeamsResponse>("/teams", {
    search: query.trim(),
  });

  return data.response.map((item) => ({
    id: item.team.id,
    name: item.team.name,
    country: item.team.country,
    logo: item.team.logo,
  }));
}

export function pickBestTeam(
  query: string,
  teams: TeamSummary[],
): TeamSummary | null {
  if (teams.length === 0) return null;

  const q = query.toLowerCase().trim();

  const exact = teams.find((team) => team.name.toLowerCase() === q);
  if (exact) return exact;

  const national = teams.find(
    (team) =>
      team.country.toLowerCase() === q ||
      (team.name.toLowerCase().includes(q) &&
        team.country.toLowerCase() === team.name.toLowerCase()),
  );
  if (national) return national;

  const startsWith = teams.find((team) =>
    team.name.toLowerCase().startsWith(q),
  );
  if (startsWith) return startsWith;

  const contains = teams.find((team) => team.name.toLowerCase().includes(q));
  if (contains) return contains;

  return teams[0];
}

function enumerateForwardDates(days: number): string[] {
  const dates: string[] = [];
  const cursor = new Date();

  for (let i = 0; i < days; i += 1) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

async function fetchDatesInBatches(
  dates: string[],
  batchSize = 4,
): Promise<FixtureSummary[]> {
  const results: FixtureSummary[] = [];

  for (let i = 0; i < dates.length; i += batchSize) {
    const batch = dates.slice(i, i + batchSize);
    const chunks = await Promise.all(
      batch.map((date) => fetchFixturesByDate(date).catch(() => [])),
    );
    results.push(...chunks.flat());
  }

  return results;
}

export async function findTeamNextFixture(
  query: string,
): Promise<TeamSpotlight | null> {
  const teams = await searchTeams(query);
  const team = pickBestTeam(query, teams);
  if (!team) return null;

  const [liveFixtures, datedFixtures] = await Promise.all([
    fetchLiveFixtures().catch(() => []),
    fetchDatesInBatches(enumerateForwardDates(14)),
  ]);

  const merged = dedupeFixtures([...liveFixtures, ...datedFixtures]);
  const nextFixture = pickClosestTeamFixture(merged, team.id);

  if (!nextFixture) return null;

  return { team, nextFixture };
}

export function filterTeamFixtures(
  fixtures: FixtureSummary[],
  teamId: number,
): FixtureSummary[] {
  return sortFixtures(
    fixtures.filter(
      (fixture) =>
        fixture.homeTeam.id === teamId || fixture.awayTeam.id === teamId,
    ),
  );
}