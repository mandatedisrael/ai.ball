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

      {detail.statistics.home && detail.statistics.away && (
        <MatchStatsBar
          home={detail.statistics.home}
          away={detail.statistics.away}
        />
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
              <div className="bg-foreground/25 h-full flex-1" />
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