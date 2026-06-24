"use client";

import { FactorChart } from "@/components/charts/factor-chart";
import { FormTrendChart } from "@/components/charts/form-trend-chart";
import { H2HChart } from "@/components/charts/h2h-chart";
import { ProbabilityChart } from "@/components/charts/probability-chart";
import type { AnalysisResult } from "@/types/analysis";

interface AnalysisChartsGridProps {
  result: AnalysisResult;
}

export function AnalysisChartsGrid({ result }: AnalysisChartsGridProps) {
  const { fixture, homeForm, awayForm, headToHead } = result.matchData;

  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-12 lg:gap-4">
      <div className="lg:col-span-4">
        <ProbabilityChart comparisons={result.comparisons} compact />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3 lg:gap-4">
        <FormTrendChart
          homeTeam={fixture.homeTeam.name}
          awayTeam={fixture.awayTeam.name}
          homeForm={homeForm}
          awayForm={awayForm}
          compact
        />
        <FactorChart factors={result.keyFactors} compact />
        <H2HChart
          matches={headToHead}
          homeTeam={fixture.homeTeam.name}
          awayTeam={fixture.awayTeam.name}
          compact
        />
      </div>
    </div>
  );
}