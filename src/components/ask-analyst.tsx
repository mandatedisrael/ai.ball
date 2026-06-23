"use client";

import { useCallback, useState } from "react";

import { TeeVerifiedBadge } from "@/components/tee-verified-badge";
import { isTeeVerified } from "@/lib/tee-verified";
import type { AnalysisResult } from "@/types/analysis";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "Why is the home side favored?",
  "What's the biggest edge vs Polymarket?",
  "How do injuries affect this match?",
  "Summarize the trading case in one line.",
];

interface AskAnalystProps {
  result: AnalysisResult | null;
}

export function AskAnalyst({ result }: AskAnalystProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendQuestion = useCallback(
    async (question: string) => {
      if (!result || !question.trim() || isLoading) return;

      const trimmed = question.trim();
      setInput("");
      setError(null);
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed, result }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Could not get an answer");
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chat failed");
      } finally {
        setIsLoading(false);
      }
    },
    [result, isLoading],
  );

  const teeVerified = result ? isTeeVerified(result) : false;

  if (!result) {
    return (
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Ask analyst</h2>
        <p className="text-muted mt-2 text-sm">
          Run a match analysis first, then ask follow-up questions.
        </p>
      </section>
    );
  }

  return (
    <section className="card flex flex-col p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Ask analyst</h2>
          <p className="text-muted text-sm">
            Follow-up questions grounded in the current analysis
          </p>
        </div>
        {teeVerified && <TeeVerifiedBadge />}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => void sendQuestion(prompt)}
            disabled={isLoading}
            className="bg-surface-elevated hover:border-accent/30 rounded-full border border-transparent px-3 py-1.5 text-xs transition disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="bg-background/50 mb-4 max-h-80 min-h-48 flex-1 space-y-3 overflow-y-auto rounded-xl border border-border p-4">
        {messages.length === 0 && (
          <p className="text-muted text-sm">
            Try a suggested prompt or type your own question below.
          </p>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[90%] ${
              message.role === "user" ? "ml-auto" : ""
            }`}
          >
            {message.role === "assistant" && teeVerified && (
              <div className="mb-1.5">
                <TeeVerifiedBadge />
              </div>
            )}
            <div
              className={`rounded-xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-accent/15 text-foreground"
                  : "bg-surface-elevated"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <p className="text-muted animate-pulse text-sm">Analyst is thinking…</p>
        )}
      </div>

      {error && <p className="text-negative mb-3 text-sm">{error}</p>}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void sendQuestion(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about form, injuries, Polymarket gap…"
          className="bg-surface-elevated focus:border-accent/40 flex-1 rounded-xl border border-border px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary rounded-xl px-5 py-3 text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </section>
  );
}