import { env, hasOpenWeather } from "@/lib/env";
import type { WeatherContext } from "@/types/fixture";

interface GeocodeResult {
  lat: number;
  lon: number;
}

interface WeatherResponse {
  weather: Array<{ description: string }>;
  main: { temp: number; humidity: number };
  wind: { speed: number };
}

export async function fetchWeatherForVenue(
  venue: string,
): Promise<WeatherContext | undefined> {
  if (!hasOpenWeather() || !venue) return undefined;

  try {
    const geoUrl = new URL("https://api.openweathermap.org/geo/1.0/direct");
    geoUrl.searchParams.set("q", venue);
    geoUrl.searchParams.set("limit", "1");
    geoUrl.searchParams.set("appid", env.openWeatherApiKey);

    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) return undefined;

    const geo = (await geoResponse.json()) as GeocodeResult[];
    const location = geo[0];
    if (!location) return undefined;

    const weatherUrl = new URL(
      "https://api.openweathermap.org/data/2.5/weather",
    );
    weatherUrl.searchParams.set("lat", String(location.lat));
    weatherUrl.searchParams.set("lon", String(location.lon));
    weatherUrl.searchParams.set("units", "metric");
    weatherUrl.searchParams.set("appid", env.openWeatherApiKey);

    const weatherResponse = await fetch(weatherUrl, {
      next: { revalidate: 1800 },
    });
    if (!weatherResponse.ok) return undefined;

    const data = (await weatherResponse.json()) as WeatherResponse;

    return {
      description: data.weather[0]?.description ?? "Unknown",
      temperatureC: Math.round(data.main.temp),
      windKph: Math.round(data.wind.speed * 3.6),
      humidity: data.main.humidity,
    };
  } catch {
    return undefined;
  }
}