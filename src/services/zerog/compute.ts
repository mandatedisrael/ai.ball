import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";
import { ethers } from "ethers";

import { env, hasZerogRouter, hasZerogCompute } from "@/lib/env";
import {
  ANALYST_SYSTEM_PROMPT,
  buildAnalystUserPrompt,
} from "@/lib/prompts/analyst";
import { analystOutputSchema } from "@/lib/schemas/analysis";
import type { AnalystOutput } from "@/lib/schemas/analysis";
import type { MatchDataBundle } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

import { routerChatCompletion } from "./router";

let brokerPromise: ReturnType<typeof createZGComputeNetworkBroker> | null = null;

async function getBroker() {
  if (!env.zerogPrivateKey) {
    throw new Error("ZEROG_PRIVATE_KEY is not configured");
  }

  if (!brokerPromise) {
    const provider = new ethers.JsonRpcProvider(env.zerogRpcUrl);
    const wallet = new ethers.Wallet(env.zerogPrivateKey, provider);
    brokerPromise = createZGComputeNetworkBroker(wallet);
  }

  return brokerPromise;
}

function extractJsonPayload(text: string): AnalystOutput {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const jsonSlice = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;

  const parsed = JSON.parse(jsonSlice);
  return analystOutputSchema.parse(parsed);
}

async function runBrokerAnalysis(
  matchData: MatchDataBundle,
  polymarket?: PolymarketMarketContext,
): Promise<AnalystOutput> {
  const broker = await getBroker();
  const services = await broker.inference.listService();
  const chatbot = services.find((s) => s.serviceType === "chatbot") ?? services[0];

  if (!chatbot?.provider) {
    throw new Error("No 0G Compute chatbot provider available");
  }

  const providerAddress = chatbot.provider;
  const { endpoint, model } =
    await broker.inference.getServiceMetadata(providerAddress);

  const messages = [
    { role: "system", content: ANALYST_SYSTEM_PROMPT },
    {
      role: "user",
      content: buildAnalystUserPrompt(matchData, polymarket),
    },
  ];

  const headers = await broker.inference.getRequestHeaders(providerAddress);

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      messages,
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`0G Compute inference failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("0G Compute returned an empty response");
  }

  return extractJsonPayload(content);
}

async function runRouterAnalysis(
  matchData: MatchDataBundle,
  polymarket?: PolymarketMarketContext,
): Promise<AnalystOutput> {
  const content = await routerChatCompletion({
    messages: [
      { role: "system", content: ANALYST_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildAnalystUserPrompt(matchData, polymarket),
      },
    ],
    temperature: 0.3,
    jsonMode: true,
  });

  return extractJsonPayload(content);
}

export async function runZerogAnalysis(
  matchData: MatchDataBundle,
  polymarket?: PolymarketMarketContext,
): Promise<AnalystOutput> {
  if (!hasZerogCompute()) {
    throw new Error("0G Compute is not configured");
  }

  if (hasZerogRouter()) {
    return runRouterAnalysis(matchData, polymarket);
  }

  return runBrokerAnalysis(matchData, polymarket);
}

export function runDemoAnalysis(
  matchData: MatchDataBundle,
  polymarket?: PolymarketMarketContext,
): AnalystOutput {
  const homeEdge = matchData.homeForm.wins >= matchData.awayForm.wins ? 0.58 : 0.44;
  const away = Math.max(0.12, 1 - homeEdge - 0.25);

  const polyHome = polymarket?.outcomes[0]?.impliedProbability;
  const insight =
    polyHome !== undefined
      ? `Model leans ${homeEdge > polyHome ? "more" : "less"} toward the home side than Polymarket (${(homeEdge * 100).toFixed(0)}% vs ${(polyHome * 100).toFixed(0)}%). Home form and availability drive the gap.`
      : "No Polymarket market to compare against; estimate is driven by form, standings, and reported absences.";

  return {
    probabilities: {
      home: homeEdge,
      draw: 0.25,
      away: Number((1 - homeEdge - 0.25).toFixed(2)) || away,
    },
    confidence: matchData.injuries.length ? "medium" : "high",
    narrative: `${matchData.fixture.homeTeam.name} arrive with stronger recent form (${matchData.homeForm.results.join(" ")} vs ${matchData.awayForm.results.join(" ")}). Standings and head-to-head trends support a home lean, though reported absences keep conviction in check.`,
    key_factors: [
      {
        factor: "Recent form",
        impact: "positive",
        weight: 0.3,
        detail: `${matchData.fixture.homeTeam.name} ${matchData.homeForm.wins}W in last ${matchData.homeForm.played}`,
      },
      {
        factor: "Injuries",
        impact: matchData.injuries.length ? "negative" : "neutral",
        weight: 0.2,
        detail:
          matchData.injuries.length > 0
            ? `${matchData.injuries.length} players flagged`
            : "No major absences reported",
      },
      {
        factor: "Table position",
        impact: "positive",
        weight: 0.2,
        detail: `${matchData.standings.map((s) => `${s.team} ${s.rank}th`).join(" · ")}`,
      },
    ],
    risks: [
      "Demo mode — connect API keys for live data",
      "Lineups may change before kickoff",
    ],
    trading_insight: insight,
  };
}