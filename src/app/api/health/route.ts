import { NextResponse } from "next/server";

import {
  env,
  getFootballProvider,
  hasFootballProvider,
  hasOpenWeather,
  hasZerogCompute,
} from "@/lib/env";
import { resolveZerogRouterModel } from "@/lib/zerog-models";

export async function GET() {
  const footballProvider = getFootballProvider();
  const football = hasFootballProvider();
  const zerogCompute = hasZerogCompute();

  return NextResponse.json({
    status: "ok",
    storage: "browser-local",
    services: {
      football,
      footballProvider,
      apiFootball: footballProvider === "api-football",
      footballData: footballProvider === "football-data",
      zerogCompute,
      openWeather: hasOpenWeather(),
      polymarket: true,
    },
    mode:
      football && zerogCompute
        ? "live"
        : football
          ? "football-only"
          : zerogCompute
            ? "compute-only"
            : "unconfigured",
    zerogRouterModel: zerogCompute
      ? resolveZerogRouterModel(env.zerogRouterModel)
      : null,
  });
}