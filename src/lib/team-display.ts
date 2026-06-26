import type { TeamSummary } from "@/types/fixture";

export const TBD_TEAM_NAME = "TBD";

export function normalizeTeamSummary(
  team: Partial<TeamSummary> | null | undefined,
): TeamSummary {
  const name = team?.name?.trim();
  return {
    id: team?.id ?? 0,
    name: name || TBD_TEAM_NAME,
    logo: team?.logo ?? undefined,
  };
}

export function displayTeamName(name?: string | null): string {
  return name?.trim() || TBD_TEAM_NAME;
}