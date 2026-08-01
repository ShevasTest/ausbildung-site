import { NextResponse } from "next/server";
import { resolveModelChain, streamWithFallback, type LlmMessage } from "@/lib/llm";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";

export const maxDuration = 60;

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_TOTAL_CHARS = 16_000;

type ChatStyle = "direkt" | "strukturiert" | "kompakt";

type ChatPayload = {
  messages?: unknown;
  style?: unknown;
  locale?: unknown;
  model?: unknown;
};

const STYLE_HINTS: Record<ChatStyle, { de: string; en: string }> = {
  direkt: {
    de: "Antworte direkt und umsetzungsorientiert mit klaren nächsten Schritten.",
    en: "Answer directly and implementation-first with clear next steps.",
  },
  strukturiert: {
    de: "Antworte klar gegliedert mit kurzen Überschriften und begründe wichtige Entscheidungen knapp.",
    en: "Answer with clear structure, short headings and brief reasoning for key decisions.",
  },
  kompakt: {
    de: "Antworte so kompakt wie möglich — nur das Wesentliche, keine Füllsätze.",
    en: "Answer as compactly as possible — essentials only, no filler.",
  },
};

function buildSystemPrompt(style: ChatStyle, locale: "de" | "en"): string {
  const styleHint = STYLE_HINTS[style][locale];

  if (locale === "de") {
    return [
      "Du bist SmartChat, der Assistent im Portfolio von Oleksandr Shevchenko (Datenpflege, Digitalisierung und Automatisierung).",
      "Du hilfst Besucher:innen bei Fragen zu Datenpflege, Automatisierung, Testautomatisierung, Webentwicklung und Bewerbung in Deutschland.",
      "Nutze Markdown; Codebeispiele in Codeblöcken mit Sprachangabe.",
      "Halte Antworten unter ca. 300 Wörtern.",
      styleHint,
      "Lehne Anfragen ohne Bezug zu Technik, Lernen oder Bewerbung höflich und kurz ab.",
    ].join(" ");
  }

  return [
    "You are SmartChat, the assistant inside the portfolio of Oleksandr Shevchenko (data maintenance, digitalisation and automation).",
    "You help visitors with questions about data maintenance, automation, test automation, web development and job applications in Germany.",
    "Use markdown; put code examples in fenced code blocks with a language tag.",
    "Keep answers under roughly 300 words.",
    styleHint,
    "Politely and briefly decline requests unrelated to technology, learning or applications.",
  ].join(" ");
}

function sanitizeMessages(raw: unknown): LlmMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  const messages: LlmMessage[] = [];

  for (const entry of raw.slice(-MAX_MESSAGES)) {
    if (!entry || typeof entry !== "object") {
      return null;
    }

    const { role, content } = entry as { role?: unknown; content?: unknown };

    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return null;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      continue;
    }

    messages.push({ role, content: trimmed.slice(0, MAX_MESSAGE_CHARS) });
  }

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return null;
  }

  const totalChars = messages.reduce((sum, message) => sum + message.content.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return null;
  }

  return messages;
}

export async function POST(request: Request) {
  const ip = clientIpFrom(request);

  if (isRateLimited(`chat:${ip}`, { windowMs: 60_000, maxRequests: 8 })) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (isRateLimited(`chat-day:${ip}`, { windowMs: 86_400_000, maxRequests: 80 })) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const payload = (await request.json().catch(() => null)) as ChatPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const messages = sanitizeMessages(payload.messages);
  if (!messages) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const style: ChatStyle =
    payload.style === "strukturiert" || payload.style === "kompakt" ? payload.style : "direkt";
  const locale = payload.locale === "en" ? "en" : "de";

  const chain = await resolveModelChain(typeof payload.model === "string" ? payload.model : undefined);
  if (chain.length === 0) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const result = await streamWithFallback(chain, {
    system: buildSystemPrompt(style, locale),
    messages,
    maxTokens: 900,
    temperature: 0.7,
  });

  if (!result) {
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "X-Llm-Label": result.model.label,
      "X-Llm-Model": result.model.id,
    },
  });
}
