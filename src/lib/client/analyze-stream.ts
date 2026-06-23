import type { AnalysisResult } from "@/types/analysis";
import type { FixtureSummary } from "@/types/fixture";
import type { AnalysisProgressStep, AnalysisStreamEvent } from "@/types/stream";

export async function runAnalysisStream(
  fixtureId: number,
  fixture: FixtureSummary | undefined,
  handlers: {
    onProgress: (step: AnalysisProgressStep, message: string) => void;
    onResult: (result: AnalysisResult) => void;
    onError: (message: string) => void;
  },
): Promise<void> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ fixtureId, fixture }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "Analysis request failed");
  }

  if (!response.body) {
    throw new Error("No response stream returned");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const lines = chunk.split("\n");
      const dataLine = lines.find((line) => line.startsWith("data: "));
      if (!dataLine) continue;

      const payload = JSON.parse(dataLine.slice(6)) as AnalysisStreamEvent;

      if (payload.type === "progress") {
        handlers.onProgress(payload.step, payload.message);
      } else if (payload.type === "result") {
        handlers.onResult(payload.result);
      } else if (payload.type === "error") {
        handlers.onError(payload.message);
      }
    }
  }
}