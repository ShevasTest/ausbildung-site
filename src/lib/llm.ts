import "server-only";

export type LlmMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LlmRequest = {
  system: string;
  messages: LlmMessage[];
  maxTokens: number;
  temperature?: number;
};

export type ProviderKind = "groq" | "openrouter" | "anthropic" | "google";

export type LlmModel = {
  /** Globally unique id exposed to the client, e.g. "groq/llama-3.3-70b-versatile". */
  id: string;
  /** Human-readable label shown to visitors, e.g. "Llama 3.3 70B · Groq". */
  label: string;
  provider: ProviderKind;
  /** Provider-native model id used for the upstream call. */
  model: string;
};

const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_LISTED_MODELS = 10;

let modelCache: { models: LlmModel[]; fetchedAt: number } | null = null;

/**
 * Free-model catalogs are noisy (music models, safety classifiers, "uncensored"
 * community builds, meta-routers). Only chat models that are presentable on an
 * application portfolio pass this filter.
 */
const BLOCKED_MODEL_PATTERN =
  /uncensored|venice|guard|safety|moderat|whisper|tts|audio|lyria|image|vision|-vl|router|distill|base$/i;

const PREFERENCE_TIERS: Array<{ pattern: RegExp; score: number }> = [
  { pattern: /llama-3\.3-70b/i, score: 100 },
  { pattern: /gpt-oss-120b/i, score: 95 },
  { pattern: /qwen3(-next|-coder|-32b)/i, score: 90 },
  { pattern: /nemotron-3-(super|ultra)/i, score: 85 },
  { pattern: /kimi-k2/i, score: 82 },
  { pattern: /gemma-4/i, score: 80 },
  { pattern: /hermes-3|405b/i, score: 75 },
  { pattern: /gpt-oss-20b/i, score: 70 },
  { pattern: /qwen3/i, score: 65 },
  { pattern: /nemotron|llama-3\.[12]/i, score: 60 },
];

function preferenceScore(model: LlmModel): number {
  let score = 40;

  for (const tier of PREFERENCE_TIERS) {
    if (tier.pattern.test(model.model)) {
      score = tier.score;
      break;
    }
  }

  // Groq serves the same open models with much lower latency — prefer it.
  if (model.provider === "groq") {
    score += 15;
  }

  return score;
}

function prettifyModelName(rawId: string): string {
  const short = rawId.split("/").pop() ?? rawId;

  return short
    .replace(/:free$/i, "")
    .replace(/-instruct|-versatile|-instant|-it\b/gi, "")
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (/^\d/.test(part) || /^(a\d+b|[0-9.]+b)$/i.test(part)) {
        return part.toUpperCase();
      }
      if (/^(gpt|oss)$/i.test(part)) {
        return part.toUpperCase();
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ")
    .trim();
}

const PROVIDER_LABELS: Record<ProviderKind, string> = {
  groq: "Groq",
  openrouter: "OpenRouter",
  anthropic: "Anthropic",
  google: "Google",
};

function toModel(provider: ProviderKind, nativeId: string, name?: string): LlmModel {
  return {
    id: `${provider}/${nativeId}`,
    label: `${name ?? prettifyModelName(nativeId)} · ${PROVIDER_LABELS[provider]}`,
    provider,
    model: nativeId,
  };
}

async function fetchGroqModels(): Promise<LlmModel[]> {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return [];
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(6_000),
    });

    // An invalid key means the provider is unusable — don't advertise its models.
    if (response.status === 401 || response.status === 403) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`groq models ${response.status}`);
    }

    const body = (await response.json()) as { data?: Array<{ id?: string }> };
    const ids = (body.data ?? [])
      .map((entry) => entry.id ?? "")
      .filter(
        (id) =>
          id.length > 0 &&
          !BLOCKED_MODEL_PATTERN.test(id) &&
          /llama-3\.[13]|gpt-oss|qwen3|kimi-k2/i.test(id),
      );

    return ids.map((id) => toModel("groq", id));
  } catch {
    return [];
  }
}

type OpenRouterModelEntry = {
  id?: string;
  name?: string;
  pricing?: { prompt?: string; completion?: string };
  architecture?: { input_modalities?: string[]; output_modalities?: string[] };
};

async function fetchOpenRouterModels(): Promise<LlmModel[]> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return [];
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      cache: "no-store",
      signal: AbortSignal.timeout(6_000),
    });

    if (!response.ok) {
      throw new Error(`openrouter models ${response.status}`);
    }

    const body = (await response.json()) as { data?: OpenRouterModelEntry[] };

    return (body.data ?? [])
      .filter((entry) => {
        const id = entry.id ?? "";
        const pricing = entry.pricing ?? {};
        const input = entry.architecture?.input_modalities ?? ["text"];
        const output = entry.architecture?.output_modalities ?? ["text"];

        return (
          id.endsWith(":free") &&
          pricing.prompt === "0" &&
          pricing.completion === "0" &&
          input.includes("text") &&
          output.includes("text") &&
          !output.some((modality) => modality !== "text") &&
          !BLOCKED_MODEL_PATTERN.test(id)
        );
      })
      .map((entry) => {
        const cleanName = entry.name?.replace(/\s*\(free\)\s*$/i, "").replace(/^[^:]+:\s*/, "");
        return toModel("openrouter", entry.id ?? "", cleanName);
      });
  } catch {
    return [];
  }
}

function staticPremiumModels(): LlmModel[] {
  const models: LlmModel[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    const id = process.env.LLM_MODEL ?? "claude-haiku-4-5";
    models.push(toModel("anthropic", id, "Claude Haiku 4.5"));
  }

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    models.push(toModel("google", "gemini-2.5-flash", "Gemini 2.5 Flash"));
  }

  return models;
}

/**
 * Aggregated, ranked list of currently available models across all configured
 * providers. The first entry is the default; the order doubles as the fallback
 * chain. Cached in-memory for 15 minutes so the free-model catalogs stay fresh
 * without hammering the upstream APIs.
 */
export async function listModels(): Promise<LlmModel[]> {
  if (modelCache && Date.now() - modelCache.fetchedAt < MODEL_CACHE_TTL_MS) {
    return modelCache.models;
  }

  const [groq, openrouter] = await Promise.all([fetchGroqModels(), fetchOpenRouterModels()]);

  const seen = new Set<string>();
  const models = [...groq, ...openrouter, ...staticPremiumModels()]
    .filter((model) => {
      if (!model.model || seen.has(model.id)) {
        return false;
      }
      seen.add(model.id);
      return true;
    })
    .sort((a, b) => preferenceScore(b) - preferenceScore(a))
    .slice(0, MAX_LISTED_MODELS);

  modelCache = { models, fetchedAt: Date.now() };
  return models;
}

/**
 * Fallback chain for a request: the explicitly requested model first (when it
 * is in the current catalog), then the ranked defaults across providers.
 */
export async function resolveModelChain(requestedId?: string): Promise<LlmModel[]> {
  const models = await listModels();

  if (!requestedId) {
    return models;
  }

  const requested = models.find((model) => model.id === requestedId);
  if (!requested) {
    return models;
  }

  return [requested, ...models.filter((model) => model.id !== requested.id)];
}

type SseExtractor = (payload: string) => string;

function extractAnthropicText(payload: string): string {
  try {
    const event = JSON.parse(payload) as {
      type?: string;
      delta?: { type?: string; text?: string };
    };

    if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
      return event.delta.text ?? "";
    }
  } catch {
    // Ignore malformed frames; upstream keeps streaming.
  }

  return "";
}

function extractOpenAiText(payload: string): string {
  try {
    const event = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };

    return event.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}

function extractGoogleText(payload: string): string {
  try {
    const event = JSON.parse(payload) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    return (
      event.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("") ?? ""
    );
  } catch {
    return "";
  }
}

/**
 * Converts a provider SSE body into a plain text stream of deltas.
 */
function sseToTextStream(body: ReadableStream<Uint8Array>, extract: SseExtractor): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = body.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex = buffer.indexOf("\n");
          while (newlineIndex !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            newlineIndex = buffer.indexOf("\n");

            if (!line.startsWith("data:")) {
              continue;
            }

            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") {
              continue;
            }

            const text = extract(payload);
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
    cancel() {
      void body.cancel();
    },
  });
}

function openAiCompatibleBody(model: LlmModel, request: LlmRequest): string {
  return JSON.stringify({
    model: model.model,
    max_tokens: request.maxTokens,
    temperature: request.temperature ?? 0.7,
    stream: true,
    messages: [{ role: "system", content: request.system }, ...request.messages],
  });
}

async function callUpstream(model: LlmModel, request: LlmRequest): Promise<Response> {
  const timeout = AbortSignal.timeout(30_000);

  switch (model.provider) {
    case "groq":
      return fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY ?? ""}`,
          "Content-Type": "application/json",
        },
        body: openAiCompatibleBody(model, request),
        signal: timeout,
      });

    case "openrouter":
      return fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://oleksandr-shevchenko.de",
          "X-Title": "Oleksandr Shevchenko Portfolio",
        },
        body: openAiCompatibleBody(model, request),
        signal: timeout,
      });

    case "anthropic":
      return fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model.model,
          system: request.system,
          max_tokens: request.maxTokens,
          temperature: request.temperature ?? 0.7,
          stream: true,
          messages: request.messages,
        }),
        signal: timeout,
      });

    case "google": {
      const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.model}:streamGenerateContent?alt=sse&key=${key}`;

      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: request.system }] },
          generationConfig: {
            maxOutputTokens: request.maxTokens,
            temperature: request.temperature ?? 0.7,
          },
          contents: request.messages.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
        }),
        signal: timeout,
      });
    }
  }
}

function extractorFor(provider: ProviderKind): SseExtractor {
  switch (provider) {
    case "anthropic":
      return extractAnthropicText;
    case "google":
      return extractGoogleText;
    default:
      return extractOpenAiText;
  }
}

/**
 * Streams a completion as plain text chunks from a single model, or null when
 * the upstream call fails.
 */
export async function streamCompletion(
  model: LlmModel,
  request: LlmRequest,
): Promise<ReadableStream<Uint8Array> | null> {
  try {
    const upstream = await callUpstream(model, request);

    if (!upstream.ok || !upstream.body) {
      return null;
    }

    return sseToTextStream(upstream.body, extractorFor(model.provider));
  } catch {
    return null;
  }
}

export type StreamResult = {
  stream: ReadableStream<Uint8Array>;
  model: LlmModel;
};

/**
 * Tries each model in the chain until one starts streaming. Free-tier catalogs
 * rotate and rate-limit, so a failed connection simply moves down the chain.
 */
export async function streamWithFallback(
  chain: LlmModel[],
  request: LlmRequest,
): Promise<StreamResult | null> {
  for (const model of chain) {
    const stream = await streamCompletion(model, request);
    if (stream) {
      return { stream, model };
    }
  }

  return null;
}
