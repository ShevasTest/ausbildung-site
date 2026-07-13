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

type ProviderKind = "anthropic" | "groq" | "google";

export type LlmProvider = {
  kind: ProviderKind;
  model: string;
  /** Human-readable label shown to visitors ("powered by ..."). */
  label: string;
};

export function resolveProvider(): LlmProvider | null {
  if (process.env.ANTHROPIC_API_KEY) {
    const model = process.env.LLM_MODEL ?? "claude-haiku-4-5";
    return { kind: "anthropic", model, label: "Claude (Anthropic)" };
  }

  if (process.env.GROQ_API_KEY) {
    const model = process.env.LLM_MODEL ?? "llama-3.3-70b-versatile";
    return { kind: "groq", model, label: "Llama 3.3 (Groq)" };
  }

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const model = process.env.LLM_MODEL ?? "gemini-2.0-flash";
    return { kind: "google", model, label: "Gemini (Google)" };
  }

  return null;
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

async function callAnthropic(provider: LlmProvider, request: LlmRequest): Promise<Response> {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      system: request.system,
      max_tokens: request.maxTokens,
      temperature: request.temperature ?? 0.7,
      stream: true,
      messages: request.messages,
    }),
  });
}

async function callGroq(provider: LlmProvider, request: LlmRequest): Promise<Response> {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: request.maxTokens,
      temperature: request.temperature ?? 0.7,
      stream: true,
      messages: [{ role: "system", content: request.system }, ...request.messages],
    }),
  });
}

async function callGoogle(provider: LlmProvider, request: LlmRequest): Promise<Response> {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:streamGenerateContent?alt=sse&key=${key}`;

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
  });
}

/**
 * Streams a completion as plain text chunks, or null when the upstream call fails.
 */
export async function streamCompletion(
  provider: LlmProvider,
  request: LlmRequest,
): Promise<ReadableStream<Uint8Array> | null> {
  const upstream =
    provider.kind === "anthropic"
      ? await callAnthropic(provider, request)
      : provider.kind === "groq"
        ? await callGroq(provider, request)
        : await callGoogle(provider, request);

  if (!upstream.ok || !upstream.body) {
    return null;
  }

  const extract =
    provider.kind === "anthropic"
      ? extractAnthropicText
      : provider.kind === "groq"
        ? extractOpenAiText
        : extractGoogleText;

  return sseToTextStream(upstream.body, extract);
}
