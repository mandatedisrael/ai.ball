"use client";

import Link from "next/link";

import {
  buildMatchPreview,
  isFixtureLive,
  isFixtureUpcoming,
} from "@/lib/match-preview";
import type { TeamSpotlight } from "@/services/football/teams";
import type { PolymarketMarketContext } from "@/types/polymarket";

interface TeamSpotlightCardProps {
  spotlight: TeamSpotlight;
  market?: PolymarketMarketContext | null;
}

export function TeamSpotlightCard({
  spotlight,
  market,
}: TeamSpotlightCardProps) {
  const { team, nextFixture } = spotlight;
  const preview = buildMatchPreview(nextFixture);
  const live = isFixtureLive(nextFixture);
  const upcoming = isFixtureUpcoming(nextFixture);
  const polyOutcome = market?.outcomes[0];

  return (
    <section className="mx-auto mt-8 max-w-3xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="label mb-1">Next match found</p>
          <h2 className="text-lg font-semibold">{team.name}</h2>
        </div>
        <span className="text-muted text-xs">{team.country}</span>
      </div>

      <Link
        href={`/match/${nextFixture.id}`}
        className="card card-hover group block overflow-hidden transition-transform hover:-translate-y-0.5"
      >
        <div className="bg-accent/8 border-accent/20 border-b px-6 py-3">
          <p className="text-accent text-sm font-medium">
            Tap for full AI analysis →
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-muted mb-1 text-sm">{nextFixture.league.name}</p>
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {nextFixture.homeTeam.name}
                <span className="text-muted mx-2 font-normal">vs</span>
                {nextFixture.awayTeam.name}
              </h3>
            </div>
            {live && (
              <span className="bg-negative/15 text-negative live-pulse flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                <span className="bg-negative h-1.5 w-1.5 rounded-full" />
                LIVE
              </span>
            )}
            {upcoming && !live && (
              <span className="bg-accent-soft text-accent shrink-0 rounded-full px-3 py-1 text-xs font-medium">
                Upcoming
              </span>
            )}
          </div>

          <p className="text-muted mb-6 text-sm">
            {new Date(nextFixture.date).toLocaleString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {nextFixture.venue && ` · ${nextFixture.venue}`}
          </p>

          <div className="mb-5 grid grid-cols-3 gap-3">
            <Metric label="Win prob" value={`${preview.winProbability}%`} />
            <Metric label="Volatility" value={preview.volatility} />
            <Metric label="Confidence" value={preview.confidence} />
          </div>

          <p className="text-muted mb-4 text-sm leading-relaxed">
            {preview.insightTeaser}
          </p>

          {market?.found && polyOutcome && (
            <div className="border-border flex items-center justify-between rounded-lg border bg-surface-elevated/50 px-4 py-3">
              <span className="label">Polymarket</span>
              <span className="font-mono text-sm font-medium">
                {polyOutcome.label}{" "}
                <span className="text-accent">${polyOutcome.price.toFixed(2)}</span>
              </span>
            </div>
          )}
        </div>
      </Link>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-elevated/60 rounded-xl px-3 py-3 text-center">
      <p className="label mb-1">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}