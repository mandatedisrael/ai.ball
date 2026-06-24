import type { MatchGoal } from "@/types/match-detail";

export function goalsForTeam(goals: MatchGoal[], teamName: string): MatchGoal[] {
  return goals.filter((goal) => goal.team === teamName);
}

export function formatGoalMinute(goal: MatchGoal): string {
  if (goal.injuryTime && goal.injuryTime > 0) {
    return `${goal.minute}+${goal.injuryTime}'`;
  }
  return `${goal.minute}'`;
}