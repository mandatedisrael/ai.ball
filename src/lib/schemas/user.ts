import { z } from "zod";

export const userPreferencesSchema = z.object({
  favoriteTeams: z.array(z.string().trim().min(2).max(60)).max(20).optional(),
  favoriteLeagues: z.array(z.number().int().positive()).max(20).optional(),
});