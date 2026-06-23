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

type Broker = {
  inference: {
    listService: () => Promise<Array<{ serviceType?: string; provider?: string }>>;
    getServiceMetadata: (provider: string) => Promise<{ endpoint: string; model: string }>;
    getRequestHeaders: (provider: string) => Promise<Record<string, string>>;
  };
};

let brokerPromise: Promise<Broker> | null = null;

async function getBroker(): Promise<Broker> {
  if (!env.zerogPrivateKey) {
    throw new Error("ZEROG_PRIVATE_KEY is not configured");
  }

  if (!brokerPromise) {
    brokerPromise = (async () => {
      const [{ createZGComputeNetworkBroker }, { ethers }] = await Promise.all([
        import("@0gfoundation/0g-compute-ts-sdk"),
        import("ethers"),
      ]);

      const provider = new ethers.JsonRpcProvider(env.zerogRpcUrl);
      const wallet = new ethers.Wallet(env.zerogPrivateKey, provider);
      return createZGComputeNetworkBroker(wallet) as unknown as Broker;
    })();
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