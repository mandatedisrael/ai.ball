import { env, hasFootballData } from "@/lib/env";

const BASE_URL = "https://api.football-data.org/v4";

export class FootballDataError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "FootballDataError";
  }
}

interface FootballDataFetchOptions {
  revalidate?: number | false;
}

export async function footballDataFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  options: FootballDataFetchOptions = {},
): Promise<T> {
  if (!hasFootballData()) {
    throw new FootballDataError("FOOTBALL_DATA_API_KEY is not configured", 503);
  }

  const url = new URL(path.startsWith("/") ? path.slice(1) : path, `${BASE_URL}/`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const fetchInit: RequestInit & { next?: { revalidate?: number | false } } = {
    headers: {
      "X-Auth-Token": env.footballDataApiKey,
    },
  };

  if (options.revalidate === false) {
    fetchInit.cache = "no-store";
  } else {
    fetchInit.next = { revalidate: options.revalidate ?? 300 };
  }

  const response = await fetch(url, fetchInit);

  if (response.status === 429) {
    throw new FootballDataError(
      "football-data.org rate limit reached (10 requests/min on free tier). Wait a moment and retry.",
      429,
    );
  }

  if (!response.ok) {
    let message = `football-data.org request failed: ${response.statusText}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    throw new FootballDataError(message, response.status);
  }

  return response.json() as Promise<T>;
}