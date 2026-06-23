"use client";

import type { TeamLineup } from "@/types/match-detail";

interface MatchLineupsProps {
  home?: TeamLineup;
  away?: TeamLineup;
}

export function MatchLineups({ home, away }: MatchLineupsProps) {
  if (!home?.starters.length && !away?.starters.length) return null;

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4">
        <p className="label mb-1">Lineups</p>
        <p className="text-muted text-xs">Confirmed starting elevens</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {home && <TeamLineupCard lineup={home} side="home" />}
        {away && <TeamLineupCard lineup={away} side="away" />}
      </div>
    </div>
  );
}

function TeamLineupCard({
  lineup,
  side,
}: {
  lineup: TeamLineup;
  side: "home" | "away";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-elevated/35 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{lineup.teamName}</p>
          {lineup.coach && (
            <p className="text-muted mt-0.5 text-xs">Coach · {lineup.coach}</p>
          )}
        </div>
        {lineup.formation && (
          <span className="bg-accent-soft text-accent rounded-full px-2.5 py-1 font-mono text-xs font-semibold">
            {lineup.formation}
          </span>
        )}
      </div>

      <p className="label mb-2">{side === "home" ? "Starting XI" : "Starting XI"}</p>
      <ul className="space-y-1.5">
        {lineup.starters.map((player) => (
          <li
            key={`${player.id ?? player.name}-${player.shirtNumber}`}
            className="flex items-center gap-2.5 text-sm"
          >
            <span className="text-muted w-6 shrink-0 text-right font-mono text-xs">
              {player.shirtNumber ?? "—"}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{player.name}</span>
            {player.position && (
              <span className="text-muted shrink-0 text-[0.65rem] uppercase tracking-wide">
                {abbreviatePosition(player.position)}
              </span>
            )}
          </li>
        ))}
      </ul>

      {lineup.substitutes.length > 0 && (
        <>
          <p className="label mb-2 mt-4">Bench</p>
          <ul className="space-y-1">
            {lineup.substitutes.map((player) => (
              <li
                key={`sub-${player.id ?? player.name}-${player.shirtNumber}`}
                className="text-muted flex items-center gap-2.5 text-xs"
              >
                <span className="w-6 shrink-0 text-right font-mono">
                  {player.shirtNumber ?? "—"}
                </span>
                <span className="truncate">{player.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function abbreviatePosition(position: string): string {
  const map: Record<string, string> = {
    Goalkeeper: "GK",
    "Centre-Back": "CB",
    "Right-Back": "RB",
    "Left-Back": "LB",
    "Defensive Midfield": "DM",
    "Central Midfield": "CM",
    "Attacking Midfield": "AM",
    "Right Winger": "RW",
    "Left Winger": "LW",
    "Centre-Forward": "ST",
  };
  return map[position] ?? position.split(" ")[0]?.slice(0, 3).toUpperCase() ?? position;
}