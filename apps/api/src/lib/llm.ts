import { z } from "zod";

// Z.AI GLM-5.2 chat completion client.
// Reasoning model: requires a generous max_tokens budget or reasoning eats it all.
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

const BASE = process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/coding/paas/v4";
const MODEL = process.env.ZAI_MODEL ?? "glm-5.2";
const KEY = process.env.ZAI_API_KEY;

if (!KEY) {
  console.warn("[llm] ZAI_API_KEY not set; LLM calls will fail.");
}

export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<string> {
  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    // GLM-5.2 is a reasoning model: it spends tokens on internal reasoning
    // before the visible answer. Give it real room.
    max_tokens: opts.maxTokens ?? 4000,
    temperature: opts.temperature ?? 0.4,
  };
  if (opts.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`ZAI chat failed ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  return content.trim();
}

// Returns parsed JSON, tolerating a leading code fence / prose wrapper.
export async function chatJson<T>(
  messages: ChatMessage[],
  schema: z.ZodType<T>,
  opts: ChatOptions = {},
): Promise<T> {
  const raw = await chat(messages, { ...opts, jsonMode: true });
  const cleaned = stripCodeFence(raw);
  const parsed = JSON.parse(cleaned) as unknown;
  return schema.parse(parsed);
}

function stripCodeFence(s: string): string {
  const trimmed = s.trim();
  if (trimmed.startsWith("```")) {
    const firstNewline = trimmed.indexOf("\n");
    const inner = trimmed.slice(firstNewline + 1);
    const end = inner.lastIndexOf("```");
    return (end >= 0 ? inner.slice(0, end) : inner).trim();
  }
  return trimmed;
}
