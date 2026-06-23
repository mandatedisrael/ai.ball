"use client";

import { useCallback, useEffect, useState } from "react";

import { MatchFeedCard } from "@/components/match-feed-card";
import { MatchSearchHeader } from "@/components/match-search-header";
import { SavedAnalyses } from "@/components/saved-analyses";
import { ServiceStatus } from "@/components/service-status";
import { TeamSpotlightCard } from "@/components/team-spotlight-card";
import { useSavedAnalyses } from "@/hooks/use-local-store";
import { deleteSavedAnalysis } from "@/lib/client/local-store";
import { WORLD_CUP_LEAGUE_ID } from "@/lib/leagues";
import type { SupportedLeague } from "@/lib/leagues";
import type { TeamSpotlight } from "@/services/football/teams";
import type { AnalysisResult } from "@/types/analysis";
import type { FixtureSummary } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [leagues, setLeagues] = useState<SupportedLeague[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number>(
    WORLD_CUP_LEAGUE_ID,
  );
  const [fixtures, setFixtures] = useState<FixtureSummary[]>([]);
  const [spotlight, setSpotlight] = useState<TeamSpotlight | null>(null);
  const [markets, setMarkets] = useState<
    Record<number, PolymarketMarketContext>
  >({});
  const [isSearching, setIsSearching] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedItems = useSavedAnalyses();

  const loadMarkets = useCallback(async (items: FixtureSummary[]) => {
    const entries = await Promise.all(
      items.slice(0, 12).map(async (fixture) => {
        try {
          const response = await fetch(`/api/fixtures/${fixture.id}/market`);
          const data = await response.json();
          return [fixture.id, data.market] as const;
        } catch {
          return [fixture.id, null] as const;
        }
      }),
    );

    setMarkets(Object.fromEntries(entries));
  }, []);

  const searchFixtures = useCallback(async () => {
    setIsSearching(true);
    setError(null);
    setSpotlight(null);

    try {
      const params = new URLSearchParams();
      const trimmed = query.trim();

      if (trimmed) {
        params.set("query", trimmed);
        setActiveQuery(trimmed);
      } else {
        params.set("leagueId", String(selectedLeagueId));
        setActiveQuery("");
      }

      const response = await fetch(`/api/fixtures/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Fixture search failed");
      }

      const nextFixtures: FixtureSummary[] = data.fixtures ?? [];
      const nextSpotlight: TeamSpotlight | null = data.spotlight ?? null;

      setFixtures(nextFixtures);
      setSpotlight(nextSpotlight);

      const marketTargets = nextSpotlight
        ? [nextSpotlight.nextFixture, ...nextFixtures]
        : nextFixtures;
      void loadMarkets(marketTargets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fixture search failed");
    } finally {
      setIsSearching(false);
    }
  }, [query, selectedLeagueId, loadMarkets]);

  const handleDeleteSaved = useCallback((id: string) => {
    deleteSavedAnalysis(id);
  }, []);

  const handleLoadSaved = useCallback((saved: AnalysisResult) => {
    window.location.href = `/match/${saved.fixtureId}`;
  }, []);

  useEffect(() => {
    void fetch("/api/leagues")
      .then((res) => res.json())
      .then((data) => setLeagues(data.leagues ?? []))
      .catch(() => setLeagues([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialFixtures() {
      setIsSearching(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/fixtures/search?leagueId=${WORLD_CUP_LEAGUE_ID}`,
        );
        const data = await response.json();
        if (!cancelled) {
          if (!response.ok) {
            throw new Error(data.error ?? "Fixture search failed");
          }
          const nextFixtures: FixtureSummary[] = data.fixtures ?? [];
          setFixtures(nextFixtures);
          setSpotlight(null);
          setActiveQuery("");
          void loadMarkets(nextFixtures);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Fixture search failed",
          );
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
          setHasInitiallyLoaded(true);
        }
      }
    }

    void loadInitialFixtures();
    return () => {
      cancelled = true;
    };
  }, [loadMarkets]);

  const sectionTitle = activeQuery
    ? `Results for “${activeQuery}”`
    : selectedLeagueId === WORLD_CUP_LEAGUE_ID
      ? "World Cup 2026"
      : leagues.find((l) => l.id === selectedLeagueId)?.name ?? "Matches";

  const showFeedGrid = !spotlight && fixtures.length > 0;
  const showInitialLoading = !hasInitiallyLoaded && isSearching;
  const showBrowseEmpty =
    hasInitiallyLoaded &&
    fixtures.length === 0 &&
    !isSearching &&
    !error &&
    !activeQuery;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10 sm:px-8">
      <MatchSearchHeader
        query={query}
        leagues={leagues}
        selectedLeagueId={selectedLeagueId}
        isSearching={isSearching}
        onQueryChange={setQuery}
        onLeagueChange={(id) => setSelectedLeagueId(id ?? WORLD_CUP_LEAGUE_ID)}
        onSearch={searchFixtures}
      />

      {spotlight && !isSearching && (
        <TeamSpotlightCard
          spotlight={spotlight}
          market={markets[spotlight.nextFixture.id]}
        />
      )}

      <ServiceStatus />

      {error && (
        <div className="card mt-4 border-negative/25 bg-negative/5 p-4 text-sm leading-6">
          <p className="text-negative font-medium">Could not load fixtures</p>
          <p className="text-muted mt-1">
            {error.includes("request limit")
              ? "API-Football daily quota is exhausted. Fixtures will refresh when the limit resets, or upgrade your plan at api-football.com."
              : error}
          </p>
        </div>
      )}

      {!spotlight && (hasInitiallyLoaded || isSearching || error) && (
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">
              {showInitialLoading ? "Loading fixtures…" : sectionTitle}
            </h2>
            {!isSearching && fixtures.length > 0 && (
              <span className="text-muted text-sm">
                {fixtures.length} fixtures
              </span>
            )}
          </div>

          {fixtures.length === 0 && !isSearching && !error && activeQuery && (
            <div className="card py-16 text-center">
              <p className="text-muted text-sm">
                No upcoming match found for “{activeQuery}”. Try the full team
                name or a different spelling.
              </p>
            </div>
          )}

          {showBrowseEmpty && (
            <div className="card py-16 text-center">
              <p className="text-muted text-sm">
                No upcoming fixtures in this league right now. Try another league
                or search a team by name.
              </p>
            </div>
          )}

          {(showInitialLoading || (isSearching && fixtures.length === 0)) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((slot) => (
                <div
                  key={slot}
                  className="card analysis-skeleton-card p-5"
                  style={{ animationDelay: `${slot * 100}ms` }}
                >
                  <div className="analysis-shimmer mb-3 h-3 w-1/3 rounded-full" />
                  <div className="analysis-shimmer mb-6 h-6 w-2/3 rounded-lg" />
                  <div className="analysis-shimmer h-16 w-full rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {showFeedGrid && (
            <div className="grid gap-4 sm:grid-cols-2">
              {fixtures.map((fixture, index) => (
                <MatchFeedCard
                  key={fixture.id}
                  fixture={fixture}
                  market={markets[fixture.id]}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {savedItems.length > 0 && (
        <div className="mt-12">
          <SavedAnalyses
            items={savedItems}
            onLoad={handleLoadSaved}
            onDelete={handleDeleteSaved}
          />
        </div>
      )}
    </main>
  );
}