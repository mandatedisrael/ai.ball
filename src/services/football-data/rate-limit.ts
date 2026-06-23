export interface FootballDataRateLimit {
  requestsAvailable: number | null;
  resetSeconds: number | null;
  apiVersion: string | null;
  client: string | null;
  updatedAt: string;
}

let lastRateLimit: FootballDataRateLimit | null = null;

export function getFootballDataRateLimit(): FootballDataRateLimit | null {
  return lastRateLimit;
}

export function captureFootballDataRateLimit(headers: Headers): FootballDataRateLimit {
  const availableHeader =
    headers.get("x-requests-available-minute") ??
    headers.get("x-requestsavailable");

  const resetHeader = headers.get("x-requestcounter-reset");

  lastRateLimit = {
    requestsAvailable: availableHeader ? Number(availableHeader) : null,
    resetSeconds: resetHeader ? Number(resetHeader) : null,
    apiVersion: headers.get("x-api-version"),
    client: headers.get("x-authenticated-client"),
    updatedAt: new Date().toISOString(),
  };

  return lastRateLimit;
}