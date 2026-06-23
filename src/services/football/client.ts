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

interface FootballFetchOptions {
  cache?: RequestCache;
  revalidate?: number | false;
}

export async function footballFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  options: FootballFetchOptions = {},
): Promise<T> {
  if (!hasApiFootball()) {
    throw new FootballApiError("API_FOOTBALL_KEY is not configured", 503);
  }

  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const fetchInit: RequestInit & { next?: { revalidate?: number | false } } = {
    headers: {
      "x-apisports-key": env.apiFootballKey,
    },
  };

  if (options.cache === "no-store" || options.revalidate === false) {
    fetchInit.cache = "no-store";
  } else {
    fetchInit.next = { revalidate: options.revalidate ?? 900 };
  }

  const response = await fetch(url, fetchInit);

  if (!response.ok) {
    throw new FootballApiError(
      `API-Football request failed: ${response.statusText}`,
      response.status,
    );
  }

  const data = (await response.json()) as T & {
    errors?: Record<string, string> | string[];
  };

  if (data.errors) {
    const message = Array.isArray(data.errors)
      ? data.errors.join(" ")
      : Object.values(data.errors).join(" ");

    if (message) {
      const status = message.toLowerCase().includes("request limit") ? 429 : 502;
      throw new FootballApiError(message, status);
    }
  }

  return data;
}