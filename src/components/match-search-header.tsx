"use client";

import { WORLD_CUP_LEAGUE_ID } from "@/lib/leagues";
import type { SupportedLeague } from "@/lib/leagues";

interface MatchSearchHeaderProps {
  query: string;
  leagues: SupportedLeague[];
  selectedLeagueId: number;
  isSearching: boolean;
  onQueryChange: (value: string) => void;
  onLeagueChange: (leagueId: number | null) => void;
  onSearch: () => void;
}

export function MatchSearchHeader({
  query,
  leagues,
  selectedLeagueId,
  isSearching,
  onQueryChange,
  onLeagueChange,
  onSearch,
}: MatchSearchHeaderProps) {
  const isWorldCup = selectedLeagueId === WORLD_CUP_LEAGUE_ID;

  return (
    <section className="mb-14">
      <div className="animate-fade-up mb-12 text-center">
        <p className="label mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5">
          <span className="analysis-live-dot" />
          World Cup 2026 · Live data
        </p>
        <h1 className="font-display mb-4 text-[2.6rem] leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
          Every match,
          <span className="text-accent"> decoded.</span>
        </h1>
        <p className="text-muted mx-auto max-w-xl text-base leading-relaxed sm:text-lg">
          Probabilities, form, injuries, and Polymarket context — analyzed inside
          0G&apos;s TEE-verified compute.
        </p>
      </div>

      <div className="animate-fade-up stagger-1 mx-auto max-w-3xl">
        <div className="card focus-within:border-accent/35 p-2 focus-within:shadow-[0_0_48px_-14px_var(--glow)]">
          <div className="relative">
            <svg
              className="text-muted pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Brazil, France, England…"
              autoFocus
              className="placeholder:text-muted/50 w-full rounded-xl bg-transparent py-5 pr-5 pl-14 text-lg font-medium outline-none sm:py-6 sm:text-xl"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            value={selectedLeagueId ?? WORLD_CUP_LEAGUE_ID}
            onChange={(e) => onLeagueChange(Number(e.target.value))}
            className="border-border text-foreground rounded-full border bg-surface px-5 py-3 text-sm font-medium outline-none focus:border-accent/40"
          >
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onSearch}
            disabled={isSearching}
            className="btn-primary px-8 py-3 text-sm sm:min-w-[148px]"
          >
            {isSearching ? "Searching…" : "Find matches"}
          </button>
        </div>

        <p className="text-muted mt-4 text-center text-xs">
          {query.trim()
            ? "We’ll surface the team’s nearest upcoming fixture"
            : isWorldCup
              ? "Browsing World Cup fixtures — or search any side by name"
              : "Pick a league or search by team"}
        </p>
      </div>
    </section>
  );
}