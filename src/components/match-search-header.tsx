"use client";

import type { SupportedLeague } from "@/lib/leagues";

interface MatchSearchHeaderProps {
  query: string;
  leagues: SupportedLeague[];
  selectedLeagueId: number | null;
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
  return (
    <header className="border-border border-b pb-6">
      <p className="editorial-label text-muted mb-4">Match Analyst</p>
      <label className="editorial-label text-foreground mb-3 block">
        Enter match or league
      </label>
      <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto]">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Arsenal, Real Madrid, Champions League…"
          className="border-border bg-surface-elevated focus:border-foreground w-full border-b bg-transparent px-0 py-3 text-2xl font-medium outline-none placeholder:text-muted/60"
        />
        <select
          value={selectedLeagueId ?? ""}
          onChange={(e) =>
            onLeagueChange(e.target.value ? Number(e.target.value) : null)
          }
          className="border-border bg-surface-elevated border px-3 py-2 text-sm outline-none"
        >
          <option value="">All leagues</option>
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
          className="bg-foreground text-background px-5 py-2 text-sm font-semibold uppercase tracking-wider disabled:opacity-50"
        >
          {isSearching ? "…" : "Search"}
        </button>
      </div>
    </header>
  );
}