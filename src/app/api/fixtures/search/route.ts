import { NextResponse } from "next/server";

import { fixtureSearchSchema } from "@/lib/schemas/analysis";
import { FootballApiError } from "@/services/football/client";
import { searchFixtures } from "@/services/football/fixtures";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = fixtureSearchSchema.safeParse({
    query: searchParams.get("query") ?? undefined,
    leagueId: searchParams.get("leagueId") ?? undefined,
    days: searchParams.get("days") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await searchFixtures(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FootballApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message =
      error instanceof Error ? error.message : "Fixture search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}