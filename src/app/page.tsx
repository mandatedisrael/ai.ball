"use client";

import { useCallback, useEffect, useState } from "react";

import { AnalysisStream } from "@/components/analysis-stream";
import { Disclaimer } from "@/components/disclaimer";
import { MatchInput } from "@/components/match-input";
import { ProbabilityBreakdown } from "@/components/probability-breakdown";
import { SavedAnalyses } from "@/components/saved-analyses";
import { ServiceStatus } from "@/components/service-status";
import { TradingInsight } from "@/components/trading-insight";
import { runAnalysisStream } from "@/lib/client/analyze-stream";
import type { SupportedLeague } from "@/lib/leagues";
import type { AnalysisResult, SavedAnalysis } from "@/types/analysis";
import type { FixtureSummary } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [leagues, setLeagues] = useState<SupportedLeague[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [fixtures, setFixtures] = useState<FixtureSummary[]>([]);
  const [selectedFixture, setSelectedFixture] = useState<FixtureSummary | null>(
    null,
  );
  const [market, setMarket] = useState<PolymarketMarketContext | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedItems, setSavedItems] = useState<SavedAnalysis[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    try {
      const response = await fetch("/api/user/preferences");
      const data = await response.json();
      if (response.ok) {
        setFavoriteTeams(data.preferences?.favoriteTeams ?? []);
      }
    } catch {
      setFavoriteTeams([]);
    }
  }, []);

  const loadSaved = useCallback(async () => {
    setIsLoadingSaved(true);
    try {
      const response = await fetch("/api/saved");
      const data = await response.json();
      if (response.ok) {
        setSavedItems(data.items ?? []);
      }
    } finally {
      setIsLoadingSaved(false);
    }
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

      setFixtures(data.fixtures ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fixture search failed");
    } finally {
      setIsSearching(false);
    }
  }, [query, selectedLeagueId]);

  const loadMarket = useCallback(async (fixtureId: number) => {
    try {
      const response = await fetch(`/api/fixtures/${fixtureId}/market`);
      const data = await response.json();
      if (response.ok) {
        setMarket(data.market ?? null);
      }
    } catch {
      setMarket(null);
    }
  }, []);

  const handleSelectFixture = useCallback(
    (fixture: FixtureSummary) => {
      setSelectedFixture(fixture);
      setResult(null);
      setSaveMessage(null);
      setProgressMessage(null);
      void loadMarket(fixture.id);
    },
    [loadMarket],
  );

  const toggleFavorite = useCallback(
    async (teamName: string) => {
      const next = favoriteTeams.includes(teamName)
        ? favoriteTeams.filter((team) => team !== teamName)
        : [...favoriteTeams, teamName];

      setFavoriteTeams(next);

      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoriteTeams: next }),
      });
    },
    [favoriteTeams],
  );

  const runAnalysis = useCallback(async () => {
    if (!selectedFixture) return;

    setIsAnalyzing(true);
    setError(null);
    setSaveMessage(null);
    setProgressMessage("Starting analysis…");
    setResult(null);

    try {
      await runAnalysisStream(selectedFixture.id, {
        onProgress: setProgressMessage,
        onResult: setResult,
        onError: (message) => {
          throw new Error(message);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
      setProgressMessage(null);
    }
  }, [selectedFixture]);

  const saveAnalysis = useCallback(async () => {
    if (!result) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Save failed");
      }

      setSaveMessage("Analysis saved with Polymarket snapshot.");
      await loadSaved();
    } catch (err) {
      setSaveMessage(
        err instanceof Error ? err.message : "Could not save analysis",
      );
    } finally {
      setIsSaving(false);
    }
  }, [result, loadSaved]);

  useEffect(() => {
    void fetch("/api/leagues")
      .then((res) => res.json())
      .then((data) => setLeagues(data.leagues ?? []))
      .catch(() => setLeagues([]));
  }, []);

  useEffect(() => {
    void loadPreferences();
    void loadSaved();
  }, [loadPreferences, loadSaved]);

  useEffect(() => {
    void searchFixtures();
  }, [searchFixtures]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-accent text-sm font-medium uppercase tracking-[0.2em]">
          Match Analyst
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Polymarket Football AI Analyst
        </h1>
        <p className="text-muted max-w-3xl text-sm leading-7">
          Research upcoming matches with structured football data, model
          probabilities, and Polymarket market context when available.
        </p>
      </header>

      <ServiceStatus />

      {error && (
        <div className="border-negative/40 bg-negative/10 text-negative rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <MatchInput
        query={query}
        leagues={leagues}
        selectedLeagueId={selectedLeagueId}
        fixtures={fixtures}
        selectedFixture={selectedFixture}
        market={market}
        favoriteTeams={favoriteTeams}
        isSearching={isSearching}
        onQueryChange={setQuery}
        onLeagueChange={setSelectedLeagueId}
        onSearch={searchFixtures}
        onSelectFixture={handleSelectFixture}
        onToggleFavorite={toggleFavorite}
        onAnalyze={runAnalysis}
        isAnalyzing={isAnalyzing}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalysisStream
          result={result}
          isLoading={isAnalyzing}
          progressMessage={progressMessage}
        />
        <ProbabilityBreakdown result={result} />
      </div>

      <TradingInsight
        result={result}
        onSave={saveAnalysis}
        isSaving={isSaving}
        saveMessage={saveMessage}
      />

      <SavedAnalyses
        items={savedItems}
        isLoading={isLoadingSaved}
        onRefresh={loadSaved}
      />

      <Disclaimer />
    </main>
  );
}