import { getSeasonForLeague, toApiFootballLeagueId } from "@/lib/leagues";
import type {
  FixtureSummary,
  HeadToHeadMatch,
  InjuryReport,
  MatchDataBundle,
  StandingContext,
  TeamForm,
} from "@/types/fixture";
import { footballFetch } from "@/services/football/client";

interface FixturesResponse {
  response: Array<{
    fixture: { date: string };
    teams: {
      home: { id: number; name: string };
      away: { id: number; name: string };
    };
    goals: { home: number | null; away: number | null };
  }>;
}

interface InjuriesResponse {
  response: Array<{
    team: { name: string };
    player: { name: string };
    reason: string;
    type: string;
  }>;
}

interface StandingsResponse {
  response: Array<{
    league: {
      standings: Array<
        Array<{
          team: { name: string };
          rank: number;
          points: number;
          all: { played: number; goalsDiff: number };
        }>
      >;
    };
  }>;
}

function deriveFormFromResults(
  results: Array<"W" | "D" | "L">,
  goalsFor: number,
  goalsAgainst: number,
): TeamForm {
  const wins = results.filter((r) => r === "W").length;
  const draws = results.filter((r) => r === "D").length;
  const losses = results.filter((r) => r === "L").length;

  return {
    played: results.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    results,
  };
}

async function fetchRecentForm(
  teamId: number,
  leagueId: number,
  season: number,
): Promise<TeamForm> {
  const data = await footballFetch<FixturesResponse>("/fixtures", {
    team: teamId,
    league: leagueId,
    season,
    last: 5,
  });

  const results: Array<"W" | "D" | "L"> = [];
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const match of data.response) {
    const homeGoals = match.goals.home ?? 0;
    const awayGoals = match.goals.away ?? 0;
    const teamIsHome = match.teams.home.id === teamId;
    const teamGoals = teamIsHome ? homeGoals : awayGoals;
    const oppGoals = teamIsHome ? awayGoals : homeGoals;

    goalsFor += teamGoals;
    goalsAgainst += oppGoals;

    if (teamGoals > oppGoals) results.push("W");
    else if (teamGoals < oppGoals) results.push("L");
    else results.push("D");
  }

  return deriveFormFromResults(results, goalsFor, goalsAgainst);
}

export async function buildMatchDataBundle(
  fixture: FixtureSummary,
): Promise<MatchDataBundle> {
  const apiLeagueId = toApiFootballLeagueId(fixture.league.id);
  const season = getSeasonForLeague(fixture.league.id);

  const [h2hData, injuriesData, standingsData, homeForm, awayForm] =
    await Promise.all([
      footballFetch<FixturesResponse>("/fixtures/headtohead", {
        h2h: `${fixture.homeTeam.id}-${fixture.awayTeam.id}`,
        last: 5,
      }),
      footballFetch<InjuriesResponse>("/injuries", {
        fixture: fixture.id,
      }),
      footballFetch<StandingsResponse>("/standings", {
        league: apiLeagueId,
        season,
      }),
      fetchRecentForm(fixture.homeTeam.id, apiLeagueId, season),
      fetchRecentForm(fixture.awayTeam.id, apiLeagueId, season),
    ]);

  const headToHead: HeadToHeadMatch[] = h2hData.response.map((m) => ({
    date: m.fixture.date.slice(0, 10),
    homeTeam: m.teams.home.name,
    awayTeam: m.teams.away.name,
    homeGoals: m.goals.home ?? 0,
    awayGoals: m.goals.away ?? 0,
  }));

  const injuries: InjuryReport[] = injuriesData.response.map((i) => ({
    team: i.team.name,
    player: i.player.name,
    reason: i.reason,
    type: i.type,
  }));

  const table = standingsData.response[0]?.league.standings[0] ?? [];
  const standings: StandingContext[] = table
    .filter((row) =>
      [fixture.homeTeam.name, fixture.awayTeam.name].includes(row.team.name),
    )
    .map((row) => ({
      team: row.team.name,
      rank: row.rank,
      points: row.points,
      played: row.all.played,
      goalDiff: row.all.goalsDiff,
    }));

  return {
    fixture,
    homeForm,
    awayForm,
    headToHead,
    injuries,
    standings,
  };
}