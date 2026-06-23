"use client";

import { formatPercent } from "@/lib/probability";
import type { SavedAnalysis } from "@/types/analysis";

interface SavedAnalysesProps {
  items: SavedAnalysis[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function SavedAnalyses({
  items,
  isLoading,
  onRefresh,
}: SavedAnalysesProps) {
  return (
    <section className="bg-surface border-border rounded-2xl border p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Saved Research</h2>
          <p className="text-muted text-sm">
            Analyses stored with Polymarket snapshots
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="text-accent text-sm font-medium hover:underline"
        >
          Refresh
        </button>
      </div>

      {isLoading && (
        <p className="text-muted text-sm">Loading saved analyses…</p>
      )}

      {!isLoading && items.length === 0 && (
        <p className="text-muted text-sm">
          No saved analyses yet. Run an analysis and click Save.
        </p>
      )}

      <ul className="grid gap-3">
        {items.map((item) => {
          const fixture = item.result.matchData.fixture;
          return (
            <li
              key={item.id}
              className="bg-surface-elevated border-border rounded-xl border px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {fixture.homeTeam.name} vs {fixture.awayTeam.name}
                </p>
                <span className="text-muted text-xs">
                  {new Date(item.savedAt).toLocaleString()}
                </span>
              </div>
              <p className="text-muted mt-1 font-mono text-xs">
                Home {formatPercent(item.result.probabilities.home)} | Draw{" "}
                {formatPercent(item.result.probabilities.draw)} | Away{" "}
                {formatPercent(item.result.probabilities.away)}
              </p>
              {item.polymarketSnapshot?.found && (
                <p className="text-muted mt-1 text-xs">
                  Polymarket snapshot captured
                  {item.polymarketSnapshot.volumeUsd
                    ? ` · $${item.polymarketSnapshot.volumeUsd.toLocaleString()} vol`
                    : ""}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}