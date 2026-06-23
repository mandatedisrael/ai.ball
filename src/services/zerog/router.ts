import { env, hasZerogRouter } from "@/lib/env";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RouterChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  jsonMode?: boolean;
}

interface RouterChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
      reasoning_content?: string;
    };
  }>;
  error?: { message?: string };
}

export async function routerChatCompletion(
  options: RouterChatOptions,
): Promise<string> {
  if (!hasZerogRouter()) {
    throw new Error("ZEROG_ROUTER_API_KEY is not configured");
  }

  const body: Record<string, unknown> = {
    model: env.zerogRouterModel,
    messages: options.messages,
    temperature: options.temperature ?? 0.4,
    stream: false,
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(`${env.zerogRouterBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.zerogRouterApiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as RouterChatResponse;

  if (!response.ok) {
    const message =
      data.error?.message ?? `Router request failed (${response.status})`;
    throw new Error(message);
  }

  const message = data.choices?.[0]?.message;
  const content = message?.content?.trim();

  if (content) {
    return content;
  }

  const reasoning = message?.reasoning_content?.trim();
  if (reasoning) {
    return reasoning;
  }

  throw new Error("0G Router returned an empty response");
}