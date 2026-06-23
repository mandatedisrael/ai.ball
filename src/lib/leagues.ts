export interface SupportedLeague {
  id: number;
  name: string;
  country: string;
}

export const SUPPORTED_LEAGUES: SupportedLeague[] = [
  { id: 39, name: "Premier League", country: "England" },
  { id: 140, name: "La Liga", country: "Spain" },
  { id: 135, name: "Serie A", country: "Italy" },
  { id: 78, name: "Bundesliga", country: "Germany" },
  { id: 61, name: "Ligue 1", country: "France" },
  { id: 2, name: "UEFA Champions League", country: "World" },
  { id: 3, name: "UEFA Europa League", country: "World" },
  { id: 94, name: "Primeira Liga", country: "Portugal" },
  { id: 88, name: "Eredivisie", country: "Netherlands" },
  { id: 1, name: "World Cup", country: "World" },
];

export function getLeagueById(id: number): SupportedLeague | undefined {
  return SUPPORTED_LEAGUES.find((league) => league.id === id);
}