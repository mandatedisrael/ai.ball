"use client";

import {
  formatMatchClock,
  formatStageLabel,
  hasDisplayableScore,
  hasLiveFeed,
  isMatchFinishedStatus,
  isMatchLiveStatus,
} from "@/lib/match-live";
import type { MatchLiveDetail } from "@/types/match-detail";

interface MatchLivePanelProps {
  detail: MatchLiveDetail;
  homeTeam: string;
  awayTeam: string;
}

export function MatchLivePanel({ detail, homeTeam, awayTeam }: MatchLivePanelProps) {
  if (!hasDisplayableScore(detail) && !hasLiveFeed(detail)) return null;

  const clock = formatMatchClock(detail);
  const stageLabel = formatStageLabel(detail);
  const live = isMatchLiveStatus(detail.status);
  const finished = isMatchFinishedStatus(detail.status);

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label mb-1">Live match centre</p>
          {stageLabel && <p className="text-muted text-xs">{stageLabel}</p>}
        </div>
        {live && clock && (
          <span className="bg-negative/15 text-negative live-pulse rounded-full px-3 py-1 font-mono text-xs font-bold">
            {clock}
          </span>
        )}
        {finished && (
          <span className="bg-surface-elevated text-muted rounded-full px-3 py-1 text-xs font-semibold">
            Full time
          </span>
        )}
      </div>

      {hasDisplayableScore(detail) && (
        <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border border-border bg-surface-elevated/40 px-4 py-5">
          <p className="truncate text-right text-sm font-semibold sm:text-base">
            {homeTeam}
          </p>
          <div className="text-center">
            <p className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {detail.score.home}
              <span className="text-muted mx-2 font-normal">–</span>
              {detail.score.away}
            </p>
            {detail.score.halfTimeHome != null && detail.score.halfTimeAway != null && (
              <p className="text-muted mt-1 font-mono text-xs">
                HT {detail.score.halfTimeHome}–{detail.score.halfTimeAway}
              </p>
            )}
          </div>
          <p className="truncate text-sm font-semibold sm:text-base">{awayTeam}</p>
        </div>
      )}

      {detail.statistics.home && detail.statistics.away && (
        <MatchStatsBar
          home={detail.statistics.home}
          away={detail.statistics.away}
        />
      )}

      {detail.goals.length > 0 && (
        <section className="mt-5">
          <p className="label mb-3">Goals</p>
          <ul className="space-y-2">
            {detail.goals.map((goal, index) => (
              <li
                key={`${goal.minute}-${goal.scorer}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-elevated/30 px-3 py-2 text-sm"
              >
                <span className="text-muted font-mono text-xs">
                  {goal.injuryTime ? `${goal.minute}+${goal.injuryTime}'` : `${goal.minute}'`}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium">{goal.scorer}</span>
                  {goal.assist && (
                    <span className="text-muted"> · {goal.assist}</span>
                  )}
                </span>
                <span className="text-muted shrink-0 text-xs">
                  {goal.homeScore}–{goal.awayScore}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(detail.bookings.length > 0 || detail.substitutions.length > 0) && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {detail.bookings.length > 0 && (
            <section>
              <p className="label mb-3">Cards</p>
              <ul className="space-y-1.5">
                {detail.bookings.map((booking, index) => (
                  <li
                    key={`${booking.minute}-${booking.player}-${index}`}
                    className="text-muted flex items-center gap-2 text-xs"
                  >
                    <CardIcon card={booking.card} />
                    <span className="font-mono">{booking.minute}'</span>
                    <span className="truncate">{booking.player}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {detail.substitutions.length > 0 && (
            <section>
              <p className="label mb-3">Substitutions</p>
              <ul className="space-y-1.5">
                {detail.substitutions.map((sub, index) => (
                  <li
                    key={`${sub.minute}-${sub.playerOut}-${index}`}
                    className="text-muted text-xs leading-5"
                  >
                    <span className="font-mono">{sub.minute}'</span>{" "}
                    <span className="line-through opacity-70">{sub.playerOut}</span>
                    {" → "}
                    <span className="text-foreground font-medium">{sub.playerIn}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function MatchStatsBar({
  home,
  away,
}: {
  home: NonNullable<MatchLiveDetail["statistics"]["home"]>;
  away: NonNullable<MatchLiveDetail["statistics"]["away"]>;
}) {
  const rows = [
    { label: "Possession", home: home.possession, away: away.possession, suffix: "%" },
    { label: "Shots", home: home.shots, away: away.shots },
    { label: "On target", home: home.shotsOnGoal, away: away.shotsOnGoal },
    { label: "Corners", home: home.corners, away: away.corners },
  ].filter((row) => row.home != null || row.away != null);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="label">Match stats</p>
      {rows.map((row) => {
        const homeVal = row.home ?? 0;
        const awayVal = row.away ?? 0;
        const total = homeVal + awayVal || 1;
        const homePct = (homeVal / total) * 100;

        return (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-xs font-medium">
              <span>
                {homeVal}
                {row.suffix ?? ""}
              </span>
              <span className="text-muted">{row.label}</span>
              <span>
                {awayVal}
                {row.suffix ?? ""}
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="bg-accent h-full transition-all duration-500"
                style={{ width: `${homePct}%` }}
              />
              <div
                className="bg-foreground/25 h-full flex-1"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CardIcon({ card }: { card: "YELLOW" | "YELLOW_RED" | "RED" }) {
  if (card === "RED" || card === "YELLOW_RED") {
    return <span className="inline-block h-3 w-2 rounded-sm bg-negative" aria-hidden />;
  }
  return <span className="inline-block h-3 w-2 rounded-sm bg-warning" aria-hidden />;
}