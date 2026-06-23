function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  apiFootballKey: optional("API_FOOTBALL_KEY"),
  polymarketGammaBaseUrl: optional(
    "POLYMARKET_GAMMA_BASE_URL",
    "https://gamma-api.polymarket.com",
  ),
  openWeatherApiKey: optional("OPENWEATHER_API_KEY"),
  zerogPrivateKey: optional("ZEROG_PRIVATE_KEY"),
  zerogRpcUrl: optional("ZEROG_RPC_URL", "https://evmrpc-testnet.0g.ai"),
  appUrl: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
} as const;

export function hasApiFootball(): boolean {
  return env.apiFootballKey.length > 0;
}

export function hasZerogCompute(): boolean {
  return env.zerogPrivateKey.length > 0;
}

export function hasOpenWeather(): boolean {
  return env.openWeatherApiKey.length > 0;
}