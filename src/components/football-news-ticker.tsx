"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { BrandBall } from "@/components/brand-ball";
import type { FootballNewsItem } from "@/types/news";

const SOURCE_VARIANTS = [
  "news-source-emerald",
  "news-source-sky",
  "news-source-violet",
  "news-source-amber",
  "news-source-rose",
  "news-source-cyan",
] as const;

function sourceVariant(source: string, index: number): string {
  const normalized = source.toLowerCase();
  if (normalized.includes("bbc")) return "news-source-rose";
  if (normalized.includes("guardian")) return "news-source-sky";
  if (normalized.includes("ai.ball")) return "news-source-emerald";
  return SOURCE_VARIANTS[index % SOURCE_VARIANTS.length];
}

export function FootballNewsTicker() {
  const [items, setItems] = useState<FootballNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        const response = await fetch("/api/news");
        const data = await response.json();
        if (!cancelled && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      } catch {
        // Skeleton remains until items load.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  const tickerItems = items.length > 0 ? [...items, ...items] : [];

  return (
    <aside
      className="news-ticker-dock"
      aria-label="Football news ticker"
      role="complementary"
    >
      <div className="news-ticker">
        <div className="news-ticker-label">
          <BrandBall size={14} className="ball-spin-slow text-white" />
          <span className="news-ticker-heading">Football news</span>
          <span className="news-ticker-live">
            <span className="news-ticker-live-dot" />
            Live
          </span>
        </div>

        <div className="news-ticker-viewport" aria-live="polite">
          {isLoading && items.length === 0 ? (
            <div className="news-ticker-skeleton">
              <span className="analysis-shimmer h-3 w-48 rounded-full" />
              <span className="analysis-shimmer h-3 w-64 rounded-full" />
              <span className="analysis-shimmer h-3 w-40 rounded-full" />
            </div>
          ) : (
            <div
              className="news-ticker-track"
              style={
                {
                  "--ticker-duration": `${Math.max(items.length * 6, 36)}s`,
                } as CSSProperties
              }
            >
              {tickerItems.map((item, index) => (
                <a
                  key={`${item.id}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-ticker-item"
                >
                  <span
                    className={`news-ticker-source ${sourceVariant(item.source, index)}`}
                  >
                    {item.source}
                  </span>
                  <span className="news-ticker-title">{item.title}</span>
                  <span
                    className={`news-ticker-separator news-ticker-separator-${index % 4}`}
                    aria-hidden
                  >
                    ⚽
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}