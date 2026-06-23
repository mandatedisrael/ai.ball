export interface LineupPlayer {
  id?: number;
  name: string;
  position?: string | null;
  shirtNumber?: number | null;
}

export interface TeamLineup {
  teamId: number;
  teamName: string;
  formation?: string;
  coach?: string;
  starters: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface MatchGoal {
  minute: number;
  injuryTime?: number | null;
  team: string;
  scorer: string;
  assist?: string | null;
  type?: string;
  homeScore: number;
  awayScore: number;
}

export interface MatchBooking {
  minute: number;
  team: string;
  player: string;
  card: "YELLOW" | "YELLOW_RED" | "RED";
}

export interface MatchSubstitution {
  minute: number;
  team: string;
  playerOut: string;
  playerIn: string;
}

export interface TeamLiveStats {
  teamName: string;
  possession?: number;
  shots?: number;
  shotsOnGoal?: number;
  corners?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
}

export interface MatchLiveDetail {
  fixtureId: number;
  status: string;
  minute?: number | null;
  injuryTime?: number | null;
  stage?: string | null;
  group?: string | null;
  matchday?: number | null;
  score: {
    home: number | null;
    away: number | null;
    halfTimeHome?: number | null;
    halfTimeAway?: number | null;
  };
  goals: MatchGoal[];
  bookings: MatchBooking[];
  substitutions: MatchSubstitution[];
  lineups: {
    home?: TeamLineup;
    away?: TeamLineup;
  };
  statistics: {
    home?: TeamLiveStats;
    away?: TeamLiveStats;
  };
  fetchedAt: string;
}