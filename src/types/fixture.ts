export interface TeamSummary {
  id: number;
  name: string;
  logo?: string;
}

export interface FixtureSummary {
  id: number;
  date: string;
  league: {
    id: number;
    name: string;
    country: string;
    logo?: string;
  };
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  venue?: string;
  status: string;
}

export interface TeamForm {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  results: Array<"W" | "D" | "L">;
}

export interface HeadToHeadMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
}

export interface InjuryReport {
  team: string;
  player: string;
  reason: string;
  type: string;
}

export interface StandingContext {
  team: string;
  rank: number;
  points: number;
  played: number;
  goalDiff: number;
}

export interface WeatherContext {
  description: string;
  temperatureC: number;
  windKph: number;
  humidity: number;
}

export interface MatchDataBundle {
  fixture: FixtureSummary;
  homeForm: TeamForm;
  awayForm: TeamForm;
  headToHead: HeadToHeadMatch[];
  injuries: InjuryReport[];
  standings: StandingContext[];
  weather?: WeatherContext;
}