import type { MatchLiveDetail, TeamLineup } from "@/types/match-detail";

import { footballDataFetch } from "./client";
import { mapFootballDataStatus } from "./mappers";

interface FootballDataLineupPlayer {
  id?: number;
  name: string;
  position?: string | null;
  shirtNumber?: number | null;
}

interface FootballDataTeamDetail {
  id: number;
  name: string;
  formation?: string | null;
  coach?: { name?: string } | null;
  lineup?: FootballDataLineupPlayer[];
  bench?: FootballDataLineupPlayer[];
  statistics?: Record<string, number | null>;
}

interface FootballDataMatchDetail {
  id: number;
  status: string;
  minute?: number | null;
  injuryTime?: number | null;
  stage?: string | null;
  group?: string | null;
  matchday?: number | null;
  homeTeam: FootballDataTeamDetail;
  awayTeam: FootballDataTeamDetail;
  score?: {
    fullTime?: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
  goals?: Array<{
    minute: number;
    injuryTime?: number | null;
    type?: string;
    team: { name: string };
    scorer: { name: string };
    assist?: { name: string } | null;
    score: { home: number; away: number };
  }>;
  bookings?: Array<{
    minute: number;
    team: { name: string };
    player: { name: string };
    card: string;
  }>;
  substitutions?: Array<{
    minute: number;
    team: { name: string };
    playerOut: { name: string };
    playerIn: { name: string };
  }>;
}

function mapLineupPlayer(player: FootballDataLineupPlayer) {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    shirtNumber: player.shirtNumber,
  };
}

function mapTeamLineup(team: FootballDataTeamDetail): TeamLineup | undefined {
  const starters = team.lineup ?? [];
  if (starters.length === 0) return undefined;

  return {
    teamId: team.id,
    teamName: team.name,
    formation: team.formation ?? undefined,
    coach: team.coach?.name,
    starters: starters.map(mapLineupPlayer),
    substitutes: (team.bench ?? []).map(mapLineupPlayer),
  };
}

function mapTeamStats(team: FootballDataTeamDetail) {
  const stats = team.statistics;
  if (!stats) return undefined;

  return {
    teamName: team.name,
    possession: stats.ball_possession ?? undefined,
    shots: stats.shots ?? undefined,
    shotsOnGoal: stats.shots_on_goal ?? undefined,
    corners: stats.corner_kicks ?? undefined,
    fouls: stats.fouls ?? undefined,
    yellowCards: stats.yellow_cards ?? undefined,
    redCards: stats.red_cards ?? undefined,
  };
}

function normalizeCard(card: string): "YELLOW" | "YELLOW_RED" | "RED" {
  if (card === "RED") return "RED";
  if (card === "YELLOW_RED") return "YELLOW_RED";
  return "YELLOW";
}

export async function getFootballDataMatchDetail(
  fixtureId: number,
): Promise<MatchLiveDetail | null> {
  try {
    const match = await footballDataFetch<FootballDataMatchDetail>(
      `/matches/${fixtureId}`,
      {},
      { revalidate: false },
    );

    const homeLineup = mapTeamLineup(match.homeTeam);
    const awayLineup = mapTeamLineup(match.awayTeam);

    return {
      fixtureId: match.id,
      status: mapFootballDataStatus(match.status),
      minute: match.minute ?? null,
      injuryTime: match.injuryTime ?? null,
      stage: match.stage ?? null,
      group: match.group ?? null,
      matchday: match.matchday ?? null,
      score: {
        home: match.score?.fullTime?.home ?? null,
        away: match.score?.fullTime?.away ?? null,
        halfTimeHome: match.score?.halfTime?.home ?? null,
        halfTimeAway: match.score?.halfTime?.away ?? null,
      },
      goals: (match.goals ?? []).map((goal) => ({
        minute: goal.minute,
        injuryTime: goal.injuryTime,
        team: goal.team.name,
        scorer: goal.scorer.name,
        assist: goal.assist?.name ?? null,
        type: goal.type,
        homeScore: goal.score.home,
        awayScore: goal.score.away,
      })),
      bookings: (match.bookings ?? []).map((booking) => ({
        minute: booking.minute,
        team: booking.team.name,
        player: booking.player.name,
        card: normalizeCard(booking.card),
      })),
      substitutions: (match.substitutions ?? []).map((sub) => ({
        minute: sub.minute,
        team: sub.team.name,
        playerOut: sub.playerOut.name,
        playerIn: sub.playerIn.name,
      })),
      lineups: {
        home: homeLineup,
        away: awayLineup,
      },
      statistics: {
        home: mapTeamStats(match.homeTeam),
        away: mapTeamStats(match.awayTeam),
      },
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}