export interface SupportedLeague {
  id: number;
  name: string;
  country: string;
}

/** football-data.org competition id */
export const WORLD_CUP_LEAGUE_ID = 2000;
export const WORLD_CUP_SEASON = 2026;

export const SUPPORTED_LEAGUES: SupportedLeague[] = [
  { id: WORLD_CUP_LEAGUE_ID, name: "FIFA World Cup", country: "World" },
  { id: 2021, name: "Premier League", country: "England" },
  { id: 2014, name: "La Liga", country: "Spain" },
  { id: 2019, name: "Serie A", country: "Italy" },
  { id: 2002, name: "Bundesliga", country: "Germany" },
  { id: 2015, name: "Ligue 1", country: "France" },
  { id: 2001, name: "UEFA Champions League", country: "Europe" },
  { id: 2146, name: "UEFA Europa League", country: "Europe" },
  { id: 2017, name: "Primeira Liga", country: "Portugal" },
  { id: 2003, name: "Eredivisie", country: "Netherlands" },
];

/** football-data.org competition codes (v4 API) */
export const LEAGUE_COMPETITION_CODES: Record<number, string> = {
  [WORLD_CUP_LEAGUE_ID]: "WC",
  2021: "PL",
  2014: "PD",
  2019: "SA",
  2002: "BL1",
  2015: "FL1",
  2001: "CL",
  2146: "EL",
  2017: "PPL",
  2003: "DED",
};

/** API-Football league ids — used only when falling back to api-sports.io */
const API_FOOTBALL_LEAGUE_IDS: Record<number, number> = {
  [WORLD_CUP_LEAGUE_ID]: 1,
  2021: 39,
  2014: 140,
  2019: 135,
  2002: 78,
  2015: 61,
  2001: 2,
  2146: 3,
  2017: 94,
  2003: 88,
};

export function getLeagueById(id: number): SupportedLeague | undefined {
  return SUPPORTED_LEAGUES.find((league) => league.id === id);
}

export function getCompetitionCode(leagueId: number): string | undefined {
  return LEAGUE_COMPETITION_CODES[leagueId];
}

export function toApiFootballLeagueId(leagueId: number): number {
  return API_FOOTBALL_LEAGUE_IDS[leagueId] ?? leagueId;
}

export function getSeasonForLeague(leagueId: number): number {
  if (leagueId === WORLD_CUP_LEAGUE_ID) {
    return WORLD_CUP_SEASON;
  }
  return new Date().getFullYear();
}