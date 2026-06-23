import { NextResponse } from "next/server";

export const maxDuration = 60;

import { createSseStream } from "@/lib/sse";
import { analyzeRequestSchema } from "@/lib/schemas/analysis";
import { analyzeFixture } from "@/services/orchestrator/analyze";

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { fixtureId, fixture } = parsed.data;
    const accept = request.headers.get("accept") ?? "";
    const wantsStream = accept.includes("text/event-stream");

    if (!wantsStream) {
      try {
        const result = await analyzeFixture(fixtureId, undefined, fixture);
        return NextResponse.json({ result });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Analysis failed unexpectedly";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    const stream = createSseStream(async (emit) => {
      try {
        const result = await analyzeFixture(
          fixtureId,
          (step, message) => {
            emit({ type: "progress", step, message });
          },
          fixture,
        );
        emit({ type: "result", result });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Analysis failed unexpectedly";
        emit({ type: "error", message });
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed unexpectedly";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}