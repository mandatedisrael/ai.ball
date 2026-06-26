import {
  getCompetitionCode,
  getSeasonForLeague,
  WORLD_CUP_LEAGUE_ID,
} from "@/lib/leagues";
import { displayTeamName } from "@/lib/team-display";
import type {
  FixtureSummary,
  HeadToHeadMatch,
  InjuryReport,
  MatchDataBundle,
  StandingContext,
  TeamForm,
} from "@/types/fixture";

import { footballDataFetch } from "./client";
import {
  mapFootballDataMatch,
  resultFromMatch,
  type FootballDataMatch,
} from "./mappers";

interface MatchesResponse {
  matches: FootballDataMatch[];
}

interface StandingsResponse {
  competition?: { type?: string };
  standings?: Array<{
    type: string;
    table: Array<{
      position: number;
      team: { id: number; name: string };
      playedGames: number;
      won: number;
      draw: number;
      lost: number;
      points: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      form?: string | null;
    }>;
  }>;
}

function formFromResults(
  results: Array<"W" | "D" | "L">,
  goalsFor: number,
  goalsAgainst: number,
): TeamForm {
  return {
    played: results.length,
    wins: results.filter((r) => r === "W").length,
    draws: results.filter((r) => r === "D").length,
    losses: results.filter((r) => r === "L").length,
    goalsFor,
    goalsAgainst,
    results,
  };
}

function formFromStandingsRow(row: {
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  form?: string | null;
}): TeamForm {
  const parsed = (row.form ?? "")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => token[0])
    .filter((token): token is "W" | "D" | "L" =>
      token === "W" || token === "D" || token === "L",
    );

  if (parsed.length > 0) {
    return formFromResults(parsed, row.goalsFor, row.goalsAgainst);
  }

  return {
    played: row.playedGames,
    wins: row.won,
    draws: row.draw,
    losses: row.lost,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    results: [],
  };
}

async function fetchRecentFormFromMatches(
  teamId: number,
): Promise<TeamForm> {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const data = await footballDataFetch<MatchesResponse>(`/teams/${teamId}/matches`, {
    dateFrom: from,
    dateTo: to,
    status: "FINISHED",
    limit: 5,
  });

  const results: Array<"W" | "D" | "L"> = [];
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const match of data.matches) {
    const result = resultFromMatch(match, teamId);
    if (!result) continue;

    const home = match.score?.fullTime?.home ?? 0;
    const away = match.score?.fullTime?.away ?? 0;
    const teamIsHome = match.homeTeam.id === teamId;
    goalsFor += teamIsHome ? home : away;
    goalsAgainst += teamIsHome ? away : home;
    results.push(result);
  }

  return formFromResults(results, goalsFor, goalsAgainst);
}

export async function buildFootballDataMatchBundle(
  fixture: FixtureSummary,
): Promise<MatchDataBundle> {
  const season = getSeasonForLeague(fixture.league.id);
  const competitionCode = getCompetitionCode(fixture.league.id);
  const isCup = fixture.league.id === WORLD_CUP_LEAGUE_ID;

  const h2hPromise = footballDataFetch<MatchesResponse>(
    `/matches/${fixture.id}/head2head`,
    { limit: 5 },
  );

  const standingsPromise =
    competitionCode && !isCup
      ? footballDataFetch<StandingsResponse>(
          `/competitions/${competitionCode}/standings`,
          { season },
        )
      : Promise.resolve(null);

  const [h2hData, standingsData, homeForm, awayForm] = await Promise.all([
    h2hPromise,
    standingsPromise,
    fetchRecentFormFromMatches(fixture.homeTeam.id),
    fetchRecentFormFromMatches(fixture.awayTeam.id),
  ]);

  const headToHead: HeadToHeadMatch[] = h2hData.matches.map((match) => ({
    date: match.utcDate.slice(0, 10),
    homeTeam: displayTeamName(match.homeTeam.name),
    awayTeam: displayTeamName(match.awayTeam.name),
    homeGoals: match.score?.fullTime?.home ?? 0,
    awayGoals: match.score?.fullTime?.away ?? 0,
  }));

  const injuries: InjuryReport[] = [];

  const table =
    standingsData?.standings?.find((standing) => standing.type === "TOTAL")
      ?.table ?? [];

  const standings: StandingContext[] = table
    .filter((row) =>
      [fixture.homeTeam.id, fixture.awayTeam.id].includes(row.team.id),
    )
    .map((row) => ({
      team: row.team.name,
      rank: row.position,
      points: row.points,
      played: row.playedGames,
      goalDiff: row.goalDifference,
    }));

  const homeStanding = table.find((row) => row.team.id === fixture.homeTeam.id);
  const awayStanding = table.find((row) => row.team.id === fixture.awayTeam.id);

  return {
    fixture,
    homeForm:
      homeStanding && homeStanding.form
        ? formFromStandingsRow(homeStanding)
        : homeForm,
    awayForm:
      awayStanding && awayStanding.form
        ? formFromStandingsRow(awayStanding)
        : awayForm,
    headToHead,
    injuries,
    standings,
  };
}