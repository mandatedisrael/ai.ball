import type { MatchLiveDetail, TeamLineup } from "@/types/match-detail";

import { footballFetch } from "./client";

interface FixtureDetailResponse {
  response: Array<{
    fixture: {
      id: number;
      status: { short: string; elapsed?: number | null };
    };
    goals: { home: number | null; away: number | null };
    score: {
      halftime: { home: number | null; away: number | null };
      fulltime: { home: number | null; away: number | null };
    };
    teams: {
      home: { id: number; name: string };
      away: { id: number; name: string };
    };
  }>;
}

interface LineupsResponse {
  response: Array<{
    team: { id: number; name: string };
    coach: { name?: string };
    formation?: string;
    startXI: Array<{ player: { id: number; name: string; number: number; pos?: string } }>;
    substitutes: Array<{ player: { id: number; name: string; number: number; pos?: string } }>;
  }>;
}

interface EventsResponse {
  response: Array<{
    time: { elapsed: number; extra?: number | null };
    team: { name: string };
    player: { name: string };
    assist?: { name: string } | null;
    type: string;
    detail: string;
  }>;
}

interface StatisticsResponse {
  response: Array<{
    team: { name: string };
    statistics: Array<{ type: string; value: number | string | null }>;
  }>;
}

function statValue(
  stats: Array<{ type: string; value: number | string | null }>,
  type: string,
): number | undefined {
  const row = stats.find((item) => item.type === type);
  if (!row || row.value == null) return undefined;
  const parsed = Number(row.value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapApiFootballLineup(entry: LineupsResponse["response"][number]): TeamLineup {
  return {
    teamId: entry.team.id,
    teamName: entry.team.name,
    formation: entry.formation,
    coach: entry.coach?.name,
    starters: entry.startXI.map((row) => ({
      id: row.player.id,
      name: row.player.name,
      shirtNumber: row.player.number,
      position: row.player.pos ?? null,
    })),
    substitutes: entry.substitutes.map((row) => ({
      id: row.player.id,
      name: row.player.name,
      shirtNumber: row.player.number,
      position: row.player.pos ?? null,
    })),
  };
}

export async function getApiFootballMatchDetail(
  fixtureId: number,
): Promise<MatchLiveDetail | null> {
  try {
    const [fixtureData, lineupsData, eventsData, statsData] = await Promise.all([
      footballFetch<FixtureDetailResponse>("/fixtures", { id: fixtureId }, { revalidate: false }),
      footballFetch<LineupsResponse>("/fixtures/lineups", { fixture: fixtureId }, { revalidate: false }).catch(() => ({ response: [] })),
      footballFetch<EventsResponse>("/fixtures/events", { fixture: fixtureId }, { revalidate: false }).catch(() => ({ response: [] })),
      footballFetch<StatisticsResponse>("/fixtures/statistics", { fixture: fixtureId }, { revalidate: false }).catch(() => ({ response: [] })),
    ]);

    const fixture = fixtureData.response[0];
    if (!fixture) return null;

    const homeTeam = fixture.teams.home;
    const awayTeam = fixture.teams.away;

    const homeLineupEntry = lineupsData.response.find((row) => row.team.id === homeTeam.id);
    const awayLineupEntry = lineupsData.response.find((row) => row.team.id === awayTeam.id);

    const goals = eventsData.response
      .filter((event) => event.type === "Goal")
      .map((event) => ({
        minute: event.time.elapsed,
        injuryTime: event.time.extra,
        team: event.team.name,
        scorer: event.player.name,
        assist: event.assist?.name ?? null,
        type: event.detail,
        homeScore: 0,
        awayScore: 0,
      }));

    let homeRunning = 0;
    let awayRunning = 0;
    for (const goal of goals) {
      if (goal.team === homeTeam.name) homeRunning += 1;
      else awayRunning += 1;
      goal.homeScore = homeRunning;
      goal.awayScore = awayRunning;
    }

    const bookings = eventsData.response
      .filter((event) => event.type === "Card")
      .map((event) => ({
        minute: event.time.elapsed,
        team: event.team.name,
        player: event.player.name,
        card:
          event.detail === "Red Card"
            ? ("RED" as const)
            : event.detail === "Second Yellow card"
              ? ("YELLOW_RED" as const)
              : ("YELLOW" as const),
      }));

    const substitutions = eventsData.response
      .filter((event) => event.type === "subst")
      .map((event) => ({
        minute: event.time.elapsed,
        team: event.team.name,
        playerOut: event.player.name,
        playerIn: event.assist?.name ?? "—",
      }));

    const homeStatsEntry = statsData.response.find((row) => row.team.name === homeTeam.name);
    const awayStatsEntry = statsData.response.find((row) => row.team.name === awayTeam.name);

    return {
      fixtureId,
      status: fixture.fixture.status.short,
      minute: fixture.fixture.status.elapsed ?? null,
      injuryTime: null,
      stage: null,
      group: null,
      matchday: null,
      score: {
        home: fixture.goals.home ?? fixture.score.fulltime.home,
        away: fixture.goals.away ?? fixture.score.fulltime.away,
        halfTimeHome: fixture.score.halftime.home,
        halfTimeAway: fixture.score.halftime.away,
      },
      goals,
      bookings,
      substitutions,
      lineups: {
        home: homeLineupEntry ? mapApiFootballLineup(homeLineupEntry) : undefined,
        away: awayLineupEntry ? mapApiFootballLineup(awayLineupEntry) : undefined,
      },
      statistics: {
        home: homeStatsEntry
          ? {
              teamName: homeTeam.name,
              possession: statValue(homeStatsEntry.statistics, "Ball Possession"),
              shots: statValue(homeStatsEntry.statistics, "Total Shots"),
              shotsOnGoal: statValue(homeStatsEntry.statistics, "Shots on Goal"),
              corners: statValue(homeStatsEntry.statistics, "Corner Kicks"),
              fouls: statValue(homeStatsEntry.statistics, "Fouls"),
              yellowCards: statValue(homeStatsEntry.statistics, "Yellow Cards"),
              redCards: statValue(homeStatsEntry.statistics, "Red Cards"),
            }
          : undefined,
        away: awayStatsEntry
          ? {
              teamName: awayTeam.name,
              possession: statValue(awayStatsEntry.statistics, "Ball Possession"),
              shots: statValue(awayStatsEntry.statistics, "Total Shots"),
              shotsOnGoal: statValue(awayStatsEntry.statistics, "Shots on Goal"),
              corners: statValue(awayStatsEntry.statistics, "Corner Kicks"),
              fouls: statValue(awayStatsEntry.statistics, "Fouls"),
              yellowCards: statValue(awayStatsEntry.statistics, "Yellow Cards"),
              redCards: statValue(awayStatsEntry.statistics, "Red Cards"),
            }
          : undefined,
      },
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}