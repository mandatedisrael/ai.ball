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
    <section className="mb-12">
      <div className="mb-10 text-center">
        <span className="bg-accent/10 text-accent mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
          <span className="bg-accent h-1.5 w-1.5 rounded-full" />
          FIFA World Cup 2026
        </span>
        <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Find your match.
          <span className="text-accent"> Analyze with AI.</span>
        </h1>
        <p className="text-muted mx-auto max-w-lg text-base leading-relaxed">
          Live World Cup fixtures, deep AI probabilities, and Polymarket
          context — all in one place.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="card focus-within:border-accent/40 focus-within:shadow-[0_0_40px_-12px_var(--glow)] p-2 transition-shadow focus-within:shadow-accent/10">
          <div className="relative">
            <svg
              className="text-accent pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 sm:left-6 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
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
              placeholder="Search teams — Brazil, France, Argentina…"
              autoFocus
              className="placeholder:text-muted/40 w-full rounded-2xl bg-transparent py-5 pr-5 pl-14 text-lg font-medium outline-none sm:py-6 sm:pl-16 sm:text-xl"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            value={selectedLeagueId ?? WORLD_CUP_LEAGUE_ID}
            onChange={(e) => onLeagueChange(Number(e.target.value))}
            className="border-border text-foreground rounded-xl border bg-surface-elevated/60 px-4 py-3 text-sm font-medium outline-none"
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
            className="bg-accent hover:bg-accent/90 rounded-xl px-8 py-3 text-sm font-semibold text-zinc-950 transition disabled:opacity-50 sm:min-w-[140px]"
          >
            {isSearching ? "Searching…" : "Search matches"}
          </button>
        </div>

        <p className="text-muted mt-3 text-center text-xs">
          {query.trim()
            ? "We’ll find the team’s closest next match across all competitions"
            : isWorldCup
              ? "Showing live and upcoming World Cup fixtures by default"
              : "Browse fixtures or search any team by name"}
        </p>
      </div>
    </section>
  );
}