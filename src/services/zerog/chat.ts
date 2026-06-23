import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";
import { ethers } from "ethers";

import { env, hasZerogCompute, hasZerogRouter } from "@/lib/env";
import {
  buildFollowUpPrompt,
  FOLLOW_UP_SYSTEM_PROMPT,
} from "@/lib/prompts/follow-up";
import type { AnalysisResult } from "@/types/analysis";

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

function runDemoChat(question: string, result: AnalysisResult): string {
  const q = question.toLowerCase();
  const homePct = (result.probabilities.home * 100).toFixed(0);

  if (q.includes("polymarket") || q.includes("market") || q.includes("edge")) {
    const gap = result.comparisons.find((c) => Math.abs(c.delta ?? 0) > 0.03);
    if (gap?.delta !== undefined) {
      return `The largest gap is on ${gap.label.toLowerCase()}: the model is ${(gap.delta * 100).toFixed(0)} points vs Polymarket. ${result.tradingInsight}`;
    }
    return result.tradingInsight;
  }

  if (q.includes("injur") || q.includes("absent")) {
    const injuryFactor = result.keyFactors.find((f) =>
      f.factor.toLowerCase().includes("injur"),
    );
    return injuryFactor
      ? `${injuryFactor.detail}. This is a key reason confidence is ${result.confidence}.`
      : "No major injury signal stood out in the data used for this analysis.";
  }

  if (q.includes("home") || q.includes("away") || q.includes("why")) {
    return `The model leans ${homePct}% home because of form, table position, and availability. ${result.narrative}`;
  }

  return `${result.tradingInsight} Ask about injuries, Polymarket divergence, or home/away bias for more detail.`;
}

export async function answerFollowUp(
  question: string,
  result: AnalysisResult,
): Promise<string> {
  const prompt = buildFollowUpPrompt(result, question);

  if (hasZerogCompute()) {
    return runZerogChat(prompt);
  }

  return runDemoChat(question, result);
}