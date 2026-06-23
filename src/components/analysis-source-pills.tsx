import type { AnalysisProgressStep } from "@/types/stream";

const SOURCES: Array<{ id: AnalysisProgressStep; label: string }> = [
  { id: "fixture", label: "Fixture" },
  { id: "football", label: "Football data" },
  { id: "polymarket", label: "Polymarket" },
  { id: "weather", label: "Weather" },
];

const SOURCE_INDEX: Record<AnalysisProgressStep, number> = {
  fixture: 0,
  football: 1,
  polymarket: 2,
  weather: 3,
  inference: 4,
  complete: 5,
};

interface AnalysisSourcePillsProps {
  activeStep?: AnalysisProgressStep | null;
  complete?: boolean;
}

export function AnalysisSourcePills({
  activeStep = "fixture",
  complete = false,
}: AnalysisSourcePillsProps) {
  const activeIndex = complete ? SOURCES.length : SOURCE_INDEX[activeStep ?? "fixture"];

  return (
    <ul className="flex flex-wrap gap-2">
      {SOURCES.map((source, index) => {
        const done = complete || index < activeIndex;
        const active = !complete && index === activeIndex;

        return (
          <li
            key={source.id}
            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-all ${
              done
                ? "bg-positive/12 text-positive ring-1 ring-positive/15"
                : active
                  ? "bg-foreground text-background shadow-[0_4px_16px_-6px_var(--glow)]"
                  : "bg-surface-elevated text-muted"
            }`}
          >
            {done ? "✓ " : active ? "● " : ""}
            {source.label}
          </li>
        );
      })}
      {(complete || activeIndex >= 4) && (
        <li
          className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
            complete
              ? "bg-positive/12 text-positive ring-1 ring-positive/15"
              : activeStep === "inference"
                ? "bg-foreground text-background shadow-[0_4px_16px_-6px_var(--glow)]"
                : "bg-surface-elevated text-muted"
          }`}
        >
          {complete ? "✓ " : activeStep === "inference" ? "● " : ""}
          AI analyst
        </li>
      )}
    </ul>
  );
}