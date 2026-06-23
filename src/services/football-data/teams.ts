import { getCompetitionCode, WORLD_CUP_LEAGUE_ID } from "@/lib/leagues";
import type { FixtureSummary } from "@/types/fixture";
import {
  dedupeFixtures,
  pickClosestTeamFixture,
  sortFixtures,
} from "@/services/football/fixtures-shared";

import { footballDataFetch } from "./client";
import { mapFootballDataMatch, type FootballDataMatch } from "./mappers";

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
  teams: Array<{
    id: number;
    name: string;
    shortName?: string;
    crest?: string;
    area?: { name?: string };
  }>;
}

interface TeamMatchesResponse {
  matches: FootballDataMatch[];
}

const SEARCH_COMPETITION_CODES = ["WC", "PL", "PD", "SA", "BL1", "FL1", "CL"];

async function loadTeamsForCompetition(code: string): Promise<TeamSummary[]> {
  const data = await footballDataFetch<TeamsResponse>(
    `/competitions/${code}/teams`,
  );

  return data.teams.map((team) => ({
    id: team.id,
    name: team.name,
    country: team.area?.name ?? "World",
    logo: team.crest,
  }));
}

let teamCache: TeamSummary[] | null = null;
let teamCacheAt = 0;
const TEAM_CACHE_MS = 60 * 60 * 1000;

async function getSearchableTeams(): Promise<TeamSummary[]> {
  if (teamCache && Date.now() - teamCacheAt < TEAM_CACHE_MS) {
    return teamCache;
  }

  const batches = await Promise.all(
    SEARCH_COMPETITION_CODES.map((code) =>
      loadTeamsForCompetition(code).catch(() => []),
    ),
  );

  const byId = new Map<number, TeamSummary>();
  for (const team of batches.flat()) {
    byId.set(team.id, team);
  }

  teamCache = [...byId.values()];
  teamCacheAt = Date.now();
  return teamCache;
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
      team.name.toLowerCase().includes(q),
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

export async function findFootballDataTeamNextFixture(
  query: string,
): Promise<TeamSpotlight | null> {
  const teams = await getSearchableTeams();
  const team = pickBestTeam(query, teams);
  if (!team) return null;

  const from = new Date().toISOString().slice(0, 10);
  const to = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const data = await footballDataFetch<TeamMatchesResponse>(
    `/teams/${team.id}/matches`,
    { dateFrom: from, dateTo: to, limit: 40 },
  );

  const fixtures = sortFixtures(data.matches.map(mapFootballDataMatch));
  const nextFixture = pickClosestTeamFixture(fixtures, team.id);
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

export async function warmTeamCacheForWorldCup(): Promise<void> {
  const code = getCompetitionCode(WORLD_CUP_LEAGUE_ID);
  if (!code) return;
  await loadTeamsForCompetition(code).catch(() => undefined);
}