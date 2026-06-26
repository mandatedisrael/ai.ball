import type { FixtureSummary } from "@/types/fixture";
import { normalizeTeamSummary } from "@/lib/team-display";

export interface FootballDataTeam {
  id: number | null;
  name: string | null;
  shortName?: string;
  crest?: string | null;
}

export interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string;
  venue?: string | null;
  competition: {
    id: number;
    name: string;
    code?: string;
    emblem?: string | null;
  };
  area?: {
    name?: string;
  };
  homeTeam: FootballDataTeam;
  awayTeam: FootballDataTeam;
  score?: {
    fullTime?: { home: number | null; away: number | null };
  };
}

const LIVE_STATUSES = new Set([
  "IN_PLAY",
  "PAUSED",
  "EXTRA_TIME",
  "PENALTY_SHOOTOUT",
]);

const FINISHED_STATUSES = new Set(["FINISHED", "AWARDED"]);

export function mapFootballDataStatus(status: string): string {
  if (LIVE_STATUSES.has(status)) return "LIVE";
  if (FINISHED_STATUSES.has(status)) return "FT";
  if (status === "SCHEDULED" || status === "TIMED") return "NS";
  return status;
}

export function mapFootballDataMatch(match: FootballDataMatch): FixtureSummary {
  return {
    id: match.id,
    date: match.utcDate,
    league: {
      id: match.competition.id,
      name: match.competition.name,
      country: match.area?.name ?? "World",
      logo: match.competition.emblem ?? undefined,
    },
    homeTeam: normalizeTeamSummary({
      id: match.homeTeam.id ?? undefined,
      name: match.homeTeam.name ?? undefined,
      logo: match.homeTeam.crest ?? undefined,
    }),
    awayTeam: normalizeTeamSummary({
      id: match.awayTeam.id ?? undefined,
      name: match.awayTeam.name ?? undefined,
      logo: match.awayTeam.crest ?? undefined,
    }),
    venue: match.venue ?? undefined,
    status: mapFootballDataStatus(match.status),
  };
}

export function resultFromMatch(
  match: FootballDataMatch,
  teamId: number,
): "W" | "D" | "L" | null {
  const home = match.score?.fullTime?.home;
  const away = match.score?.fullTime?.away;
  if (home == null || away == null) return null;

  const teamIsHome = match.homeTeam.id === teamId;
  const teamGoals = teamIsHome ? home : away;
  const oppGoals = teamIsHome ? away : home;

  if (teamGoals > oppGoals) return "W";
  if (teamGoals < oppGoals) return "L";
  return "D";
}