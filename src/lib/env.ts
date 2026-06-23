import { DEFAULT_ZEROG_ROUTER_MODEL } from "@/lib/zerog-models";

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  apiFootballKey: optional("API_FOOTBALL_KEY"),
  footballDataApiKey: optional("FOOTBALL_DATA_API_KEY"),
  polymarketGammaBaseUrl: optional(
    "POLYMARKET_GAMMA_BASE_URL",
    "https://gamma-api.polymarket.com",
  ),
  openWeatherApiKey: optional("OPENWEATHER_API_KEY"),
  zerogPrivateKey: optional("ZEROG_PRIVATE_KEY"),
  zerogRpcUrl: optional("ZEROG_RPC_URL", "https://evmrpc-testnet.0g.ai"),
  zerogRouterApiKey: optional("ZEROG_ROUTER_API_KEY"),
  zerogRouterBaseUrl: optional(
    "ZEROG_ROUTER_BASE_URL",
    "https://router-api.0g.ai/v1",
  ),
  zerogRouterModel: optional("ZEROG_ROUTER_MODEL", DEFAULT_ZEROG_ROUTER_MODEL),
  appUrl: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
} as const;

export function hasApiFootball(): boolean {
  return env.apiFootballKey.length > 0;
}

export function hasFootballData(): boolean {
  return env.footballDataApiKey.length > 0;
}

export function hasFootballProvider(): boolean {
  return hasFootballData() || hasApiFootball();
}

export function getFootballProvider(): "football-data" | "api-football" | "none" {
  if (hasFootballData()) return "football-data";
  if (hasApiFootball()) return "api-football";
  return "none";
}

export function hasZerogRouter(): boolean {
  return env.zerogRouterApiKey.length > 0;
}

export function hasZerogCompute(): boolean {
  return hasZerogRouter() || env.zerogPrivateKey.length > 0;
}

export function hasOpenWeather(): boolean {
  return env.openWeatherApiKey.length > 0;
}