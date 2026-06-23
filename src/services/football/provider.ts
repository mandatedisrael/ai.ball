import { getFootballProvider } from "@/lib/env";
import type { FixtureSummary, MatchDataBundle } from "@/types/fixture";

import { buildFootballDataMatchBundle } from "../football-data/match-data";
import {
  getFootballDataFixtureById,
  searchFootballDataFixtures,
} from "../football-data/fixtures";
import { findFootballDataTeamNextFixture } from "../football-data/teams";
import type { TeamSpotlight } from "../football-data/teams";

import {
  getFixtureById as getApiFootballFixtureById,
  searchFixtures as searchApiFootballFixtures,
  type FixtureSearchResult,
} from "./fixtures";
import { buildMatchDataBundle as buildApiFootballBundle } from "./match-data";
import { findTeamNextFixture as findApiFootballTeamNextFixture } from "./teams";

export type { FixtureSearchResult, TeamSpotlight };

export async function searchFixtures(
  options: Parameters<typeof searchApiFootballFixtures>[0],
): Promise<FixtureSearchResult> {
  if (getFootballProvider() === "football-data") {
    return searchFootballDataFixtures(options);
  }
  return searchApiFootballFixtures(options);
}

export async function getFixtureById(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  if (getFootballProvider() === "football-data") {
    return getFootballDataFixtureById(fixtureId);
  }
  return getApiFootballFixtureById(fixtureId);
}

export async function buildMatchDataBundle(
  fixture: FixtureSummary,
): Promise<MatchDataBundle> {
  if (getFootballProvider() === "football-data") {
    return buildFootballDataMatchBundle(fixture);
  }
  return buildApiFootballBundle(fixture);
}

export async function findTeamNextFixture(
  query: string,
): Promise<TeamSpotlight | null> {
  if (getFootballProvider() === "football-data") {
    return findFootballDataTeamNextFixture(query);
  }
  return findApiFootballTeamNextFixture(query);
}