import { env, hasZerogCompute, hasZerogRouter } from "@/lib/env";
import {
  buildFollowUpPrompt,
  FOLLOW_UP_SYSTEM_PROMPT,
} from "@/lib/prompts/follow-up";
import type { AnalysisResult } from "@/types/analysis";

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

async function runBrokerChat(prompt: string): Promise<string> {
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
    { role: "system", content: FOLLOW_UP_SYSTEM_PROMPT },
    { role: "user", content: prompt },
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
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`0G chat failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content?.trim() ?? "No response generated.";
}

async function runZerogChat(prompt: string): Promise<string> {
  if (hasZerogRouter()) {
    return routerChatCompletion({
      messages: [
        { role: "system", content: FOLLOW_UP_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    });
  }

  return runBrokerChat(prompt);
}

export async function answerFollowUp(
  question: string,
  result: AnalysisResult,
): Promise<string> {
  if (!hasZerogCompute()) {
    throw new Error("0G Compute is not configured. Set ZEROG_ROUTER_API_KEY.");
  }

  const prompt = buildFollowUpPrompt(result, question);
  return runZerogChat(prompt);
}