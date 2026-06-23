import { NextResponse } from "next/server";

import { FootballDataError } from "@/services/football-data/client";
import { FootballApiError } from "@/services/football/client";
import { getMatchDetail } from "@/services/football/provider";
import { isMatchLiveStatus } from "@/lib/match-live";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const fixtureId = Number(id);

  if (!Number.isFinite(fixtureId) || fixtureId <= 0) {
    return NextResponse.json({ error: "Invalid fixture id" }, { status: 400 });
  }

  try {
    const detail = await getMatchDetail(fixtureId);
    if (!detail) {
      return NextResponse.json({ error: "Match detail not found" }, { status: 404 });
    }

    const response = NextResponse.json({ detail });
    if (isMatchLiveStatus(detail.status)) {
      response.headers.set("Cache-Control", "no-store, max-age=0");
    } else {
      response.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    }

    return response;
  } catch (error) {
    if (error instanceof FootballDataError || error instanceof FootballApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message =
      error instanceof Error ? error.message : "Match detail lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}