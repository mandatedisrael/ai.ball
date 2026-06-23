export interface UserPreferences {
  favoriteTeams: string[];
  favoriteLeagues: number[];
  updatedAt: string;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  favoriteTeams: [],
  favoriteLeagues: [],
  updatedAt: new Date(0).toISOString(),
};