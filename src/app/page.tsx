"use client";

import { useCallback, useEffect, useState } from "react";

import { MatchFeedCard } from "@/components/match-feed-card";
import { MatchSearchHeader } from "@/components/match-search-header";
import { SavedAnalyses } from "@/components/saved-analyses";
import { ServiceStatus } from "@/components/service-status";
import { useSavedAnalyses } from "@/hooks/use-local-store";
import { deleteSavedAnalysis } from "@/lib/client/local-store";
import type { SupportedLeague } from "@/lib/leagues";
import type { AnalysisResult } from "@/types/analysis";
import type { FixtureSummary } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [leagues, setLeagues] = useState<SupportedLeague[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [fixtures, setFixtures] = useState<FixtureSummary[]>([]);
  const [markets, setMarkets] = useState<
    Record<number, PolymarketMarketContext>
  >({});
  const [isSearching, setIsSearching] = useState(false);
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

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      if (selectedLeagueId) params.set("leagueId", String(selectedLeagueId));

      const response = await fetch(`/api/fixtures/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Fixture search failed");
      }

      const nextFixtures: FixtureSummary[] = data.fixtures ?? [];
      setFixtures(nextFixtures);
      void loadMarkets(nextFixtures);
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
      try {
        const response = await fetch("/api/fixtures/search");
        const data = await response.json();
        if (!cancelled && response.ok) {
          const nextFixtures: FixtureSummary[] = data.fixtures ?? [];
          setFixtures(nextFixtures);
          void loadMarkets(nextFixtures);
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }

    void loadInitialFixtures();
    return () => {
      cancelled = true;
    };
  }, [loadMarkets]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10 sm:px-8">
      <MatchSearchHeader
        query={query}
        leagues={leagues}
        selectedLeagueId={selectedLeagueId}
        isSearching={isSearching}
        onQueryChange={setQuery}
        onLeagueChange={setSelectedLeagueId}
        onSearch={searchFixtures}
      />

      <div className="mt-6">
        <ServiceStatus />
      </div>

      {error && (
        <p className="text-negative mt-4 text-sm">{error}</p>
      )}

      <section className="mt-4">
        {fixtures.length === 0 && !isSearching && (
          <p className="text-muted py-10 text-sm">No fixtures found.</p>
        )}

        {fixtures.map((fixture, index) => (
          <MatchFeedCard
            key={fixture.id}
            fixture={fixture}
            market={markets[fixture.id]}
            muted={index > 0 && index % 4 === 0}
          />
        ))}
      </section>

      {savedItems.length > 0 && (
        <div className="mt-10">
          <SavedAnalyses
            items={savedItems}
            onLoad={handleLoadSaved}
            onDelete={handleDeleteSaved}
          />
        </div>
      )}

      <p className="text-muted mt-12 border-border border-t pt-6 text-xs leading-6">
        Research and analysis only. Not financial, betting, or investment
        advice. Polymarket prices shown for market context when available.
      </p>
    </main>
  );
}