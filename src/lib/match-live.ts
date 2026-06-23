import type { MatchLiveDetail } from "@/types/match-detail";

const LIVE_STATUSES = new Set(["LIVE", "1H", "2H", "HT", "ET", "P", "BT", "INT"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO", "ABD"]);

export function isMatchLiveStatus(status: string): boolean {
  return LIVE_STATUSES.has(status);
}

export function isMatchFinishedStatus(status: string): boolean {
  return FINISHED_STATUSES.has(status);
}

export function hasDisplayableScore(detail: MatchLiveDetail): boolean {
  return detail.score.home != null && detail.score.away != null;
}

export function formatMatchClock(detail: MatchLiveDetail): string | null {
  if (!isMatchLiveStatus(detail.status)) return null;
  if (detail.minute == null) return "LIVE";

  const base = `${detail.minute}'`;
  if (detail.injuryTime && detail.injuryTime > 0) {
    return `${detail.minute}+${detail.injuryTime}'`;
  }
  return base;
}

export function formatStageLabel(detail: MatchLiveDetail): string | null {
  const parts: string[] = [];
  if (detail.group) parts.push(detail.group.replace(/_/g, " "));
  if (detail.stage && detail.stage !== "REGULAR_SEASON") {
    parts.push(detail.stage.replace(/_/g, " "));
  }
  if (detail.matchday) parts.push(`Matchday ${detail.matchday}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function hasLineups(detail: MatchLiveDetail): boolean {
  return Boolean(detail.lineups.home?.starters.length || detail.lineups.away?.starters.length);
}

export function hasLiveFeed(detail: MatchLiveDetail): boolean {
  return (
    detail.goals.length > 0 ||
    detail.bookings.length > 0 ||
    detail.substitutions.length > 0 ||
    Boolean(detail.statistics.home || detail.statistics.away)
  );
}