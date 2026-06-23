import { env } from "@/lib/env";

export class PolymarketApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "PolymarketApiError";
  }
}

export async function gammaFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(path, env.polymarketGammaBaseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    throw new PolymarketApiError(
      `Polymarket Gamma request failed: ${response.statusText}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}