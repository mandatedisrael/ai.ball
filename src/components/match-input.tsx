"use client";

import type { SupportedLeague } from "@/lib/leagues";
import type { FixtureSummary } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

interface MatchInputProps {
  query: string;
  leagues: SupportedLeague[];
  selectedLeagueId: number | null;
  fixtures: FixtureSummary[];
  selectedFixture: FixtureSummary | null;
  market: PolymarketMarketContext | null;
  favoriteTeams: string[];
  isSearching: boolean;
  onQueryChange: (value: string) => void;
  onLeagueChange: (leagueId: number | null) => void;
  onSearch: () => void;
  onSelectFixture: (fixture: FixtureSummary) => void;
  onToggleFavorite: (teamName: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function MatchInput({
  query,
  leagues,
  selectedLeagueId,
  fixtures,
  selectedFixture,
  market,
  favoriteTeams,
  isSearching,
  onQueryChange,
  onLeagueChange,
  onSearch,
  onSelectFixture,
  onToggleFavorite,
  onAnalyze,
  isAnalyzing,
}: MatchInputProps) {
  return (
    <section className="bg-surface border-border rounded-2xl border p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Match Input</h2>
          <p className="text-muted text-sm">
            Search upcoming fixtures across major leagues
          </p>
        </div>
        {market && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              market.found
                ? "bg-accent-soft text-accent"
                : "bg-surface-elevated text-muted"
            }`}
          >
            {market.found ? "Polymarket ✓" : "No Polymarket market"}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_220px_auto]">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Arsenal, Real Madrid, Champions League…"
          className="bg-surface-elevated border-border focus:border-accent w-full rounded-xl border px-4 py-3 text-sm outline-none"
        />
        <select
          value={selectedLeagueId ?? ""}
          onChange={(e) =>
            onLeagueChange(e.target.value ? Number(e.target.value) : null)
          }
          className="bg-surface-elevated border-border focus:border-accent rounded-xl border px-4 py-3 text-sm outline-none"
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
          className="bg-surface-elevated border-border hover:border-accent rounded-xl border px-5 py-3 text-sm font-medium transition disabled:opacity-60"
        >
          {isSearching ? "Searching…" : "Search"}
        </button>
      </div>

      {favoriteTeams.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {favoriteTeams.map((team) => (
            <button
              key={team}
              type="button"
              onClick={() => {
                onQueryChange(team);
                onSearch();
              }}
              className="bg-accent-soft text-accent rounded-full px-3 py-1 text-xs font-medium"
            >
              ★ {team}
            </button>
          ))}
        </div>
      )}

      {fixtures.length > 0 && (
        <ul className="mt-4 grid gap-2">
          {fixtures.map((fixture) => {
            const selected = selectedFixture?.id === fixture.id;
            return (
              <li key={fixture.id}>
                <div
                  className={`rounded-xl border px-4 py-3 transition ${
                    selected
                      ? "border-accent bg-accent-soft/40"
                      : "border-border bg-surface-elevated"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectFixture(fixture)}
                      className="text-left"
                    >
                      <span className="font-medium">
                        {fixture.homeTeam.name} vs {fixture.awayTeam.name}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(fixture.homeTeam.name)}
                        className="text-muted hover:text-accent text-xs"
                        title="Favorite home team"
                      >
                        {favoriteTeams.includes(fixture.homeTeam.name)
                          ? "★"
                          : "☆"}{" "}
                        {fixture.homeTeam.name}
                      </button>
                      <span className="text-muted text-xs">
                        {new Date(fixture.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted mt-1 text-xs">
                    {fixture.league.name} · {fixture.venue ?? "Venue TBD"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selectedFixture && market?.found && (
        <p className="text-muted mt-4 text-sm">
          Match Winner
          {market.volumeUsd
            ? ` · $${market.volumeUsd.toLocaleString()} volume`
            : ""}
          {market.lowLiquidity ? " · Low liquidity" : ""}
        </p>
      )}

      <button
        type="button"
        onClick={onAnalyze}
        disabled={!selectedFixture || isAnalyzing}
        className="bg-accent hover:bg-accent/90 mt-5 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isAnalyzing ? "Analyzing match…" : "Run AI Analysis"}
      </button>
    </section>
  );
}