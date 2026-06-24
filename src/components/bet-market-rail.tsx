"use client";

import { resolveBettingLink } from "@/lib/betting-links";
import type { FixtureSummary } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

interface BetMarketRailProps {
  fixture: FixtureSummary;
  market?: PolymarketMarketContext | null;
  resultMarket?: PolymarketMarketContext | null;
  visible?: boolean;
  variant?: "inline" | "mobile";
}

export function BetMarketRail({
  fixture,
  market,
  resultMarket,
  visible = true,
  variant = "inline",
}: BetMarketRailProps) {
  if (!visible) return null;

  const link = resolveBettingLink(fixture, market, resultMarket);
  const isPolymarket = link.venue === "polymarket";

  if (variant === "mobile") {
    return (
      <div
        className="bet-rail-mobile animate-fade-in pointer-events-none fixed inset-x-0 bottom-[var(--news-ticker-height)] z-40 px-4 pb-3 lg:hidden"
        aria-label={`${link.label} — opens in a new tab`}
      >
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`bet-rail-cta pointer-events-auto ${isPolymarket ? "bet-rail-polymarket" : "bet-rail-kalshi"}`}
        >
          <BetCtaContent
            isPolymarket={isPolymarket}
            label={link.label}
            subtitle={link.subtitle}
            compact
          />
        </a>
      </div>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`bet-rail-cta bet-rail-cta-inline animate-fade-in ${isPolymarket ? "bet-rail-polymarket" : "bet-rail-kalshi"}`}
      aria-label={`${link.label} — opens in a new tab`}
    >
      <BetCtaContent
        isPolymarket={isPolymarket}
        label={link.label}
        subtitle={link.subtitle}
        compact
      />
    </a>
  );
}

function BetCtaContent({
  isPolymarket,
  label,
  subtitle,
  compact = false,
}: {
  isPolymarket: boolean;
  label: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <>
      <span className="bet-rail-icon" aria-hidden>
        {isPolymarket ? "PM" : "K"}
      </span>
      <span className="bet-rail-copy">
        <span className="bet-rail-label">{label}</span>
        {!compact && subtitle && (
          <span className="bet-rail-subtitle">{subtitle}</span>
        )}
      </span>
      <span className="bet-rail-arrow" aria-hidden>
        ↗
      </span>
    </>
  );
}