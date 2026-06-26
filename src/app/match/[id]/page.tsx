"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AnalysisProgress } from "@/components/analysis-progress";
import { LoadingBall } from "@/components/loading-ball";
import { AnalysisResultsPanel } from "@/components/analysis-results-panel";
import { AskAnalyst } from "@/components/ask-analyst";
import { BetMarketRail } from "@/components/bet-market-rail";
import { MatchLineups } from "@/components/match-lineups";
import { MatchLivePanel } from "@/components/match-live-panel";
import { MatchScorecard } from "@/components/match-scorecard";

import { runAnalysisStream } from "@/lib/client/analyze-stream";
import { readStashedFixture } from "@/lib/client/fixture-session";
import { saveAnalysisResult } from "@/lib/client/local-store";
import {
  formatMatchClock,
  formatStageLabel,
  hasDisplayableScore,
  hasLineups,
  hasLiveFeed,
  isMatchLiveStatus,
} from "@/lib/match-live";
import {
  buildMatchPreview,
  isFixtureLive,
  isFixtureUpcoming,
} from "@/lib/match-preview";
import type { AnalysisResult } from "@/types/analysis";
import type { FixtureSummary } from "@/types/fixture";
import type { MatchLiveDetail } from "@/types/match-detail";
import type { PolymarketMarketContext } from "@/types/polymarket";
import type { AnalysisProgressStep } from "@/types/stream";

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const fixtureId = Number(params.id);

  const [fixture, setFixture] = useState<FixtureSummary | null>(null);
  const [market, setMarket] = useState<PolymarketMarketContext | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progressStep, setProgressStep] = useState<AnalysisProgressStep | null>(
    null,
  );
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [matchDetail, setMatchDetail] = useState<MatchLiveDetail | null>(null);

  const loadMatchDetail = useCallback(async () => {
    if (!Number.isFinite(fixtureId) || fixtureId <= 0) return null;

    try {
      const response = await fetch(`/api/fixtures/${fixtureId}/detail`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) return null;

      const detail = data.detail as MatchLiveDetail;
      setMatchDetail(detail);
      setFixture((current) =>
        current
          ? {
              ...current,
              status: detail.status || current.status,
            }
          : current,
      );
      return detail;
    } catch {
      return null;
    }
  }, [fixtureId]);

  const saveAnalysis = useCallback(() => {
    if (!result) return;
    setIsSaving(true);
    try {
      saveAnalysisResult(result);
      setSaveMessage("Analysis saved in your browser.");
    } finally {
      setIsSaving(false);
    }
  }, [result]);

  useEffect(() => {
    if (!Number.isFinite(fixtureId) || fixtureId <= 0) return;

    let cancelled = false;
    const stashedFixture = readStashedFixture(fixtureId);
    if (stashedFixture) {
      setFixture(stashedFixture);
    }

    async function loadAndAnalyze() {
      setIsBootstrapping(true);
      setProgressStep("fixture");
      setProgressMessage("Fetching match details…");

      try {
        const fixtureRes = await fetch(`/api/fixtures/${fixtureId}`);
        const fixtureData = await fixtureRes.json();
        if (!fixtureRes.ok) {
          if (stashedFixture) {
            // Search already resolved this fixture; keep showing it while analysis runs.
            if (cancelled) return;
          } else {
            throw new Error(fixtureData.error ?? "Fixture not found");
          }
        } else if (!cancelled) {
          setFixture(fixtureData.fixture);
        }
        if (cancelled) return;

        const resolvedFixture: FixtureSummary | null =
          fixtureRes.ok && fixtureData.fixture
            ? fixtureData.fixture
            : stashedFixture;

        const marketRes = await fetch(`/api/fixtures/${fixtureId}/market`);
        const marketData = await marketRes.json();
        if (!cancelled && marketRes.ok) {
          setMarket(marketData.market ?? null);
        }

        if (!resolvedFixture) {
          throw new Error("Fixture not found");
        }

        setIsAnalyzing(true);
        setProgressStep("fixture");
        setProgressMessage("Starting in-depth analysis…");

        await runAnalysisStream(fixtureId, resolvedFixture, {
          onProgress: (step, message) => {
            if (cancelled) return;
            setProgressStep(step);
            setProgressMessage(message);
          },
          onResult: (analysis) => {
            if (!cancelled) setResult(analysis);
          },
          onError: (message) => {
            throw new Error(message);
          },
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Analysis failed");
        }
      } finally {
        if (!cancelled) {
          setIsAnalyzing(false);
          setIsBootstrapping(false);
          setProgressStep(null);
          setProgressMessage(null);
        }
      }
    }

    void loadAndAnalyze();
    return () => {
      cancelled = true;
    };
  }, [fixtureId]);

  useEffect(() => {
    if (!Number.isFinite(fixtureId) || fixtureId <= 0) return;
    void loadMatchDetail();
  }, [fixtureId, loadMatchDetail]);

  useEffect(() => {
    const status = matchDetail?.status ?? fixture?.status;
    if (!status || !isMatchLiveStatus(status)) return;

    const interval = window.setInterval(() => {
      void loadMatchDetail();
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [fixture?.status, loadMatchDetail, matchDetail?.status]);

  const preview = fixture ? buildMatchPreview(fixture) : null;
  const live = matchDetail
    ? isMatchLiveStatus(matchDetail.status)
    : fixture
      ? isFixtureLive(fixture)
      : false;
  const upcoming = fixture ? isFixtureUpcoming(fixture) : false;
  const showBetRail =
    !!fixture &&
    !error &&
    (isBootstrapping || isAnalyzing || !!progressStep || !!result);

  return (
    <>
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 pb-32 sm:px-8 lg:pb-8">
      <Link
        href="/"
        className="text-muted hover:text-accent mb-8 inline-flex items-center gap-1.5 text-sm font-medium"
      >
        ← Back to matches
      </Link>

      {!fixture && isBootstrapping && !error && (
        <header className="card mb-8 p-6 sm:p-8">
          <LoadingBall label="Loading match…" />
        </header>
      )}

      {fixture && (
        <header className="card mb-8 p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-muted mb-2 text-sm">{fixture.league.name}</p>

              <div className="mt-1">
                <MatchScorecard
                  homeTeam={fixture.homeTeam.name}
                  awayTeam={fixture.awayTeam.name}
                  homeLogo={fixture.homeTeam.logo}
                  awayLogo={fixture.awayTeam.logo}
                  homeScore={
                    matchDetail && hasDisplayableScore(matchDetail)
                      ? (matchDetail.score.home ?? 0)
                      : undefined
                  }
                  awayScore={
                    matchDetail && hasDisplayableScore(matchDetail)
                      ? (matchDetail.score.away ?? 0)
                      : undefined
                  }
                  halfTimeHome={matchDetail?.score.halfTimeHome}
                  halfTimeAway={matchDetail?.score.halfTimeAway}
                  goals={matchDetail?.goals}
                  clock={
                    live && matchDetail ? formatMatchClock(matchDetail) : null
                  }
                  probabilities={
                    result
                      ? {
                          home: result.probabilities.home,
                          away: result.probabilities.away,
                          draw: result.probabilities.draw,
                        }
                      : undefined
                  }
                />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2.5">
              <div className="flex gap-2">
                {live && (
                  <span className="bg-negative/15 text-negative live-pulse flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                    <span className="bg-negative h-1.5 w-1.5 rounded-full" />
                    LIVE
                  </span>
                )}
                {upcoming && !live && (
                  <span className="bg-accent-soft text-accent rounded-full px-3 py-1 text-xs font-medium">
                    Upcoming
                  </span>
                )}
              </div>
              <BetMarketRail
                fixture={fixture}
                market={market}
                resultMarket={result?.polymarket}
                visible={showBetRail}
                variant="inline"
              />
            </div>
          </div>

          <p className="text-muted text-sm">
            {new Date(fixture.date).toLocaleString()} ·{" "}
            {fixture.venue ?? "Venue TBD"}
            {matchDetail && formatStageLabel(matchDetail) && (
              <> · {formatStageLabel(matchDetail)}</>
            )}
          </p>

          {preview && !result && !isAnalyzing && !progressStep && (
            <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
              <MetricCard label="Win prob" value={`${preview.winProbability}%`} />
              <MetricCard label="Volatility" value={preview.volatility} />
              <MetricCard label="Confidence" value={preview.confidence} />
            </div>
          )}
        </header>
      )}

      {fixture &&
        matchDetail &&
        (hasLiveFeed(matchDetail) || hasDisplayableScore(matchDetail)) && (
        <div className="mb-6">
          <MatchLivePanel
            detail={matchDetail}
            homeTeam={fixture.homeTeam.name}
            awayTeam={fixture.awayTeam.name}
          />
        </div>
      )}

      {matchDetail && hasLineups(matchDetail) && (
        <div className="mb-6">
          <MatchLineups
            home={matchDetail.lineups.home}
            away={matchDetail.lineups.away}
          />
        </div>
      )}

      {!result && (isBootstrapping || isAnalyzing || progressStep) && (
        <AnalysisProgress
          activeStep={progressStep}
          message={progressMessage}
          homeTeam={fixture?.homeTeam.name}
          awayTeam={fixture?.awayTeam.name}
        />
      )}

      {error && (
        <div className="card text-negative mb-4 p-4 text-sm">{error}</div>
      )}

      {result && (
        <div className="space-y-6">
          <AnalysisResultsPanel
            result={result}
            market={market}
            volatility={preview?.volatility ?? "MED"}
            onSave={saveAnalysis}
            isSaving={isSaving}
            saveMessage={saveMessage}
          />
          <AskAnalyst result={result} />
        </div>
      )}

    </main>

    {fixture && (
      <BetMarketRail
        fixture={fixture}
        market={market}
        resultMarket={result?.polymarket}
        visible={showBetRail}
        variant="mobile"
      />
    )}
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated/50 px-4 py-3 text-center">
      <p className="label mb-1">{label}</p>
      <p className="text-xl font-bold capitalize">{value}</p>
    </div>
  );
}