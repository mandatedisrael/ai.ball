"use client";

import Link from "next/link";

import { BrandBall } from "@/components/brand-ball";
import { MatchTeamsHeading } from "@/components/match-teams-heading";
import { stashFixtureForNavigation } from "@/lib/client/fixture-session";
import {
  buildMatchPreview,
  isFixtureLive,
  isFixtureUpcoming,
} from "@/lib/match-preview";
import type { FixtureSummary } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

interface MatchFeedCardProps {
  fixture: FixtureSummary;
  market?: PolymarketMarketContext | null;
  index?: number;
}

export function MatchFeedCard({ fixture, market, index = 0 }: MatchFeedCardProps) {
  const preview = buildMatchPreview(fixture);
  const live = isFixtureLive(fixture);
  const upcoming = isFixtureUpcoming(fixture);
  const polyOutcome = market?.outcomes[0];
  const staggerClass =
    index % 4 === 0
      ? ""
      : index % 4 === 1
        ? "stagger-1"
        : index % 4 === 2
          ? "stagger-2"
          : "stagger-3";

  return (
    <Link
      href={`/match/${fixture.id}`}
      onClick={() => stashFixtureForNavigation(fixture)}
      className={`card card-hover animate-fade-up group flex flex-col p-5 ${staggerClass}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="label mb-1.5">{fixture.league.name}</p>
          <MatchTeamsHeading
            homeTeam={fixture.homeTeam}
            awayTeam={fixture.awayTeam}
          />
        </div>
        {live && (
          <span className="bg-negative/12 text-negative live-pulse flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold tracking-wide uppercase">
            <span className="bg-negative h-1.5 w-1.5 rounded-full" />
            Live
          </span>
        )}
        {upcoming && !live && (
          <span className="bg-accent-soft text-accent shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide uppercase">
            Soon
          </span>
        )}
      </div>

      <p className="text-muted mb-4 text-xs">
        {new Date(fixture.date).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {fixture.venue && ` · ${fixture.venue}`}
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <StatPill label="Win prob" value={`${preview.winProbability}%`} />
        <StatPill label="Volatility" value={preview.volatility} />
        <StatPill label="Confidence" value={preview.confidence} />
      </div>

      <p className="text-muted mb-4 line-clamp-2 flex-1 text-sm leading-relaxed">
        {preview.insightTeaser}
      </p>

      {market?.found && polyOutcome && (
        <div className="border-border mt-auto flex items-center justify-between rounded-xl border bg-surface-elevated/60 px-3 py-2.5">
          <span className="label">Polymarket</span>
          <span className="font-mono text-xs font-semibold">
            {polyOutcome.label}{" "}
            <span className="text-accent">${polyOutcome.price.toFixed(2)}</span>
          </span>
        </div>
      )}

      <span className="text-accent mt-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
        <BrandBall size={12} className="group-hover-ball-roll" />
        Open analysis →
      </span>
    </Link>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated/50 px-2.5 py-2 text-center">
      <p className="label mb-0.5">{label}</p>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}