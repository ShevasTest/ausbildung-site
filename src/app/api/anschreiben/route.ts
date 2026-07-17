import { NextResponse } from "next/server";
import { resolveModelChain, streamWithFallback } from "@/lib/llm";
import { encodeLlmLabel } from "@/lib/llm-label";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";

export const maxDuration = 60;

const MAX_VACANCY_CHARS = 6_000;
const MAX_NAME_CHARS = 80;
const MAX_CITY_CHARS = 80;
const MAX_STRENGTHS = 3;

type AnschreibenPayload = {
  vacancyText?: unknown;
  focus?: unknown;
  tone?: unknown;
  strengths?: unknown;
  applicantName?: unknown;
  applicantCity?: unknown;
  locale?: unknown;
  model?: unknown;
};

const FOCUS_HINTS: Record<string, { de: string; en: string }> = {
  frontend: {
    de: "Schwerpunkt: Frontend und UX (responsive UI, Accessibility, Performance).",
    en: "Focus: frontend and UX (responsive UI, accessibility, performance).",
  },
  fullstack: {
    de: "Schwerpunkt: Full-Stack-Orientierung (APIs, Datenfluss, saubere Schnittstellen).",
    en: "Focus: full-stack orientation (APIs, data flow, clean interfaces).",
  },
  teamfit: {
    de: "Schwerpunkt: Teamfit und Junior-Rolle (Lernkurve, Zuverlässigkeit, Zusammenarbeit).",
    en: "Focus: team fit and a junior role (learning curve, reliability, collaboration).",
  },
  ai: {
    de: "Schwerpunkt: produktiver, verantwortungsvoller Einsatz von KI-Tools im Entwicklungsalltag.",
    en: "Focus: productive, responsible use of AI tools in daily development work.",
  },
};

const TONE_HINTS: Record<string, { de: string; en: string }> = {
  professional: {
    de: "Ton: professionell, klar und sachlich.",
    en: "Tone: professional, clear and factual.",
  },
  motivated: {
    de: "Ton: motiviert und energiegeladen, aber glaubwürdig.",
    en: "Tone: motivated and energetic, but credible.",
  },
  direct: {
    de: "Ton: direkt, kompakt und selbstbewusst.",
    en: "Tone: direct, compact and confident.",
  },
};

function buildSystemPrompt(locale: "de" | "en"): string {
  if (locale === "de") {
    return [
      "Du bist ein erfahrener Bewerbungscoach für den deutschen IT-Arbeitsmarkt (QA und Testautomatisierung, Junior bis Mid-Level).",
      "Du schreibst Anschreiben für Oleksandr (Test Automation Engineer mit Playwright-Schwerpunkt):",
      "Vier Jahre tägliche, selbstständige Browser-Automatisierung mit Playwright (Tausende parallele Sessions, Selector-Engineering, Wait-Strategien, Proxy-/Session-Management, Failure-Recovery, mitmproxy-Traffic-Analyse). Öffentliche E2E-Suite (Playwright + TypeScript, Page Object Model, API- und Accessibility-Tests) mit GitHub Actions CI gegen Produktion. 1. Platz unter ~12.000 im RS School / EPAM Vorbereitungskurs; Bachelor Wirtschaftskybernetik (ZAB-anerkannt). Web-Grundlagen ehrlich eingeordnet, KI-gestützter Workflow. Ukrainisch/Russisch Muttersprache, Deutsch B1, Englisch im Aufbau.",
      "Regeln: Erfinde keine Abschlüsse, Zeugnisse, Anstellungen oder Framework-Expertise. Bezeichne die vier Jahre als selbstständige Automatisierungspraxis. Vermeide übertriebene Aussagen wie 'idealer Kandidat'. Stelle KI-Kompetenz konkret und verantwortungsvoll dar und bleibe bei diesem Profil.",
      "Struktur: Betreffzeile, Anrede, Einstieg mit Bezug zur Stelle, 2–3 Absätze Passung/Motivation, Abschluss mit Gesprächswunsch, Grußformel.",
      "Länge: 220–320 Wörter. Sprache: Deutsch. Keine Markdown-Formatierung, nur reiner Brieftext.",
    ].join(" ");
  }

  return [
    "You are an experienced application coach for the German IT job market (QA and test automation, junior to mid level).",
    "You write cover letters for Oleksandr (test automation engineer focused on Playwright):",
    "four years of daily, self-employed browser automation with Playwright (thousands of parallel sessions, selector engineering, wait strategies, proxy/session management, failure recovery, mitmproxy traffic analysis). Public e2e suite (Playwright + TypeScript, Page Object Model, API and accessibility tests) with GitHub Actions CI against production. 1st place among ~12,000 in the RS School / EPAM preparation course; bachelor's in Economic Cybernetics (ZAB-recognized). Honestly framed web fundamentals, AI-assisted workflow. Ukrainian/Russian native, German B1, English improving.",
    "Rules: never invent degrees, certificates, employment or framework expertise. Describe the four years as self-employed automation practice. Avoid inflated claims such as 'ideal candidate'. Present AI ability concretely and responsibly, and stay within this profile.",
    "Structure: subject line, salutation, opening tied to the vacancy, 2–3 paragraphs on fit/motivation, closing with interview interest, sign-off.",
    "Length: 220–320 words. Language: English. No markdown formatting, plain letter text only.",
  ].join(" ");
}

export async function POST(request: Request) {
  const ip = clientIpFrom(request);

  if (isRateLimited(`anschreiben:${ip}`, { windowMs: 60_000, maxRequests: 4 })) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (isRateLimited(`anschreiben-day:${ip}`, { windowMs: 86_400_000, maxRequests: 40 })) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const payload = (await request.json().catch(() => null)) as AnschreibenPayload | null;
  if (!payload || typeof payload.vacancyText !== "string") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const vacancyText = payload.vacancyText.trim().slice(0, MAX_VACANCY_CHARS);
  if (vacancyText.length < 30) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const locale = payload.locale === "en" ? "en" : "de";
  const focusHint = FOCUS_HINTS[typeof payload.focus === "string" ? payload.focus : ""] ?? FOCUS_HINTS.frontend;
  const toneHint = TONE_HINTS[typeof payload.tone === "string" ? payload.tone : ""] ?? TONE_HINTS.professional;

  const strengths = Array.isArray(payload.strengths)
    ? payload.strengths
        .filter((item): item is string => typeof item === "string")
        .slice(0, MAX_STRENGTHS)
        .map((item) => item.slice(0, 60))
    : [];

  const applicantName =
    typeof payload.applicantName === "string" && payload.applicantName.trim()
      ? payload.applicantName.trim().slice(0, MAX_NAME_CHARS)
      : "Oleksandr Shevchenko";
  const applicantCity =
    typeof payload.applicantCity === "string" ? payload.applicantCity.trim().slice(0, MAX_CITY_CHARS) : "";

  const userPrompt = [
    locale === "de" ? "Stellenanzeige:" : "Vacancy text:",
    vacancyText,
    "",
    focusHint[locale],
    toneHint[locale],
    strengths.length > 0
      ? locale === "de"
        ? `Hervorzuhebende Stärken: ${strengths.join(", ")}.`
        : `Strengths to highlight: ${strengths.join(", ")}.`
      : "",
    locale === "de" ? `Name des Bewerbers: ${applicantName}.` : `Applicant name: ${applicantName}.`,
    applicantCity
      ? locale === "de"
        ? `Wohnort: ${applicantCity} (mit Datumszeile beginnen).`
        : `City: ${applicantCity} (start with a date line).`
      : "",
    locale === "de" ? "Schreibe jetzt das vollständige Anschreiben." : "Now write the complete cover letter.",
  ]
    .filter(Boolean)
    .join("\n");

  const chain = await resolveModelChain(typeof payload.model === "string" ? payload.model : undefined);
  if (chain.length === 0) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const result = await streamWithFallback(chain, {
    system: buildSystemPrompt(locale),
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 1_000,
    temperature: 0.6,
  });

  if (!result) {
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "X-Llm-Label": encodeLlmLabel(result.model.label),
      "X-Llm-Model": result.model.id,
    },
  });
}
