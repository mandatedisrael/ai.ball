"use client";

import { TeamLogo } from "@/components/team-logo";
import { formatGoalMinute, goalsForTeam } from "@/lib/match-goals";
import { resolveDrawProbability } from "@/lib/probability";
import type { MatchGoal } from "@/types/match-detail";

interface MatchProbabilities {
  home: number;
  away: number;
  draw?: number;
}

interface MatchScorecardProps {
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore?: number;
  awayScore?: number;
  halfTimeHome?: number | null;
  halfTimeAway?: number | null;
  goals?: MatchGoal[];
  clock?: string | null;
  probabilities?: MatchProbabilities;
}

export function MatchScorecard({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeScore,
  awayScore,
  halfTimeHome,
  halfTimeAway,
  goals = [],
  clock,
  probabilities,
}: MatchScorecardProps) {
  const hasScore = homeScore != null && awayScore != null;
  const homeGoals = goalsForTeam(goals, homeTeam);
  const awayGoals = goalsForTeam(goals, awayTeam);

  const draw = probabilities
    ? resolveDrawProbability(
        probabilities.home,
        probabilities.away,
        probabilities.draw,
      )
    : 0;

  const homeWinPct = probabilities
    ? (probabilities.home * 100).toFixed(1)
    : null;
  const awayWinPct = probabilities
    ? (probabilities.away * 100).toFixed(1)
    : null;
  const drawPct = probabilities ? (draw * 100).toFixed(1) : null;
  const showDraw = drawPct != null && Number(drawPct) >= 0.5;

  return (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-x-4 gap-y-3 sm:gap-x-8">
        <div className="min-w-0 text-right">
          <div className="flex items-center justify-end gap-2">
            <p className="font-display text-base font-bold leading-tight sm:text-lg">
              {homeTeam}
            </p>
            <TeamLogo name={homeTeam} logo={homeLogo} size={32} />
          </div>
          <TeamGoalScorers goals={homeGoals} align="right" />
          {homeWinPct != null && (
            <p className="text-accent mt-2 font-mono text-sm font-bold sm:text-base">
              {homeWinPct}%
              <span className="text-muted ml-1 text-[11px] font-normal sm:text-xs">
                win
              </span>
            </p>
          )}
        </div>

        <div className="min-w-[5.5rem] px-1 text-center sm:min-w-[7rem]">
          {hasScore ? (
            <>
              <p className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {homeScore}
                <span className="text-muted mx-1 font-normal sm:mx-1.5">–</span>
                {awayScore}
              </p>
              {halfTimeHome != null && halfTimeAway != null && (
                <p className="text-muted mt-0.5 font-mono text-[11px] sm:text-xs">
                  HT {halfTimeHome}–{halfTimeAway}
                </p>
              )}
              {clock && (
                <p className="text-negative mt-0.5 font-mono text-[11px] font-bold sm:text-xs">
                  {clock}
                </p>
              )}
            </>
          ) : (
            <span className="text-muted font-display text-sm font-medium">vs</span>
          )}
          {showDraw && (
            <p className="text-muted mt-2 font-mono text-[11px] sm:text-xs">
              <span className="text-foreground font-semibold">{drawPct}%</span> draw
            </p>
          )}
        </div>

        <div className="min-w-0 text-left">
          <div className="flex items-center gap-2">
            <TeamLogo name={awayTeam} logo={awayLogo} size={32} />
            <p className="font-display text-base font-bold leading-tight sm:text-lg">
              {awayTeam}
            </p>
          </div>
          <TeamGoalScorers goals={awayGoals} align="left" />
          {awayWinPct != null && (
            <p className="text-accent mt-2 font-mono text-sm font-bold sm:text-base">
              {awayWinPct}%
              <span className="text-muted ml-1 text-[11px] font-normal sm:text-xs">
                win
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamGoalScorers({
  goals,
  align,
}: {
  goals: MatchGoal[];
  align: "left" | "right";
}) {
  if (goals.length === 0) return null;

  return (
    <ul
      className={`mt-1.5 space-y-0.5 ${align === "right" ? "text-right" : "text-left"}`}
    >
      {goals.map((goal, index) => (
        <li
          key={`${goal.minute}-${goal.scorer}-${index}`}
          className="text-muted text-[11px] leading-4 sm:text-xs"
        >
          <span className="text-foreground font-medium">{goal.scorer}</span>
          <span className="font-mono"> {formatGoalMinute(goal)}</span>
        </li>
      ))}
    </ul>
  );
}