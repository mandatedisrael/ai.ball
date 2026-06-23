import { env, hasApiFootball } from "@/lib/env";

const BASE_URL = "https://v3.football.api-sports.io";

export class FootballApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "FootballApiError";
  }
}

export async function footballFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  if (!hasApiFootball()) {
    throw new FootballApiError("API_FOOTBALL_KEY is not configured", 503);
  }

  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": env.apiFootballKey,
    },
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new FootballApiError(
      `API-Football request failed: ${response.statusText}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}