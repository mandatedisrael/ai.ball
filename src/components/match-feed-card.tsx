"use client";

import Link from "next/link";

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
  muted?: boolean;
}

export function MatchFeedCard({
  fixture,
  market,
  muted = false,
}: MatchFeedCardProps) {
  const preview = buildMatchPreview(fixture);
  const live = isFixtureLive(fixture);
  const upcoming = isFixtureUpcoming(fixture);
  const polyOutcome = market?.outcomes[0];

  return (
    <article
      className={`border-border border-b py-8 ${muted ? "opacity-45" : ""}`}
    >
      <Link href={`/match/${fixture.id}`} className="group block">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight group-hover:underline sm:text-3xl">
            {fixture.homeTeam.name} v {fixture.awayTeam.name}
            {live && <span className="text-muted ml-2 text-base">• LIVE</span>}
          </h2>
          {upcoming && !live && (
            <span className="editorial-label text-muted">Upcoming</span>
          )}
        </div>

        <div className="mb-5 grid grid-cols-3 gap-4">
          <Metric label="Win Prob." value={`${preview.winProbability}%`} />
          <Metric label="Volatility" value={preview.volatility} />
          <Metric
            label="Confidence"
            value={preview.confidence.toUpperCase()}
          />
        </div>

        <p className="mb-5 max-w-3xl text-sm leading-7 text-foreground/90">
          › {preview.insightTeaser}
        </p>

        {market?.found && polyOutcome && (
          <div className="bg-foreground text-background inline-block px-4 py-3 text-sm">
            <p className="editorial-label mb-1 text-background/70">
              Polymarket Odds
            </p>
            <p className="font-medium">
              {polyOutcome.label} / ${polyOutcome.price.toFixed(2)}
            </p>
          </div>
        )}
      </Link>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="metric-label mb-1">{label}</p>
      <p className="text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}