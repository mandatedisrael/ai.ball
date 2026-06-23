"use client";

import { formatPercent } from "@/lib/probability";
import type { AnalysisResult, SavedAnalysis } from "@/types/analysis";

interface SavedAnalysesProps {
  items: SavedAnalysis[];
  onLoad: (result: AnalysisResult) => void;
  onDelete: (id: string) => void;
}

export function SavedAnalyses({ items, onLoad, onDelete }: SavedAnalysesProps) {
  return (
    <section className="bg-surface border-border rounded-2xl border p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Saved Research</h2>
        <p className="text-muted text-sm">
          Stored in your browser — click to reload an analysis
        </p>
      </div>

      {items.length === 0 && (
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
                <button
                  type="button"
                  onClick={() => onLoad(item.result)}
                  className="text-left font-medium hover:text-accent transition"
                >
                  {fixture.homeTeam.name} vs {fixture.awayTeam.name}
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-muted text-xs">
                    {new Date(item.savedAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="text-muted hover:text-negative text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onLoad(item.result)}
                className="text-muted mt-1 block text-left font-mono text-xs hover:text-foreground"
              >
                Home {formatPercent(item.result.probabilities.home)} | Draw{" "}
                {formatPercent(item.result.probabilities.draw)} | Away{" "}
                {formatPercent(item.result.probabilities.away)}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}