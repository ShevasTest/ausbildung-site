import { NextResponse } from "next/server";
import { resolveModelChain, streamWithFallback } from "@/lib/llm";
import { encodeLlmLabel } from "@/lib/llm-label";
import { clientIpFrom, isRateLimited } from "@/lib/rate-limit";

export const maxDuration = 60;

const MAX_VACANCY_CHARS = 6_000;
const MAX_NAME_CHARS = 80;
const MAX_CITY_CHARS = 80;
const MAX_PROFILE_CHARS = 1_500;
const MAX_STRENGTHS = 3;
const DEFAULT_APPLICANT = "Oleksandr Shevchenko";

type AnschreibenPayload = {
  vacancyText?: unknown;
  focus?: unknown;
  tone?: unknown;
  strengths?: unknown;
  applicantName?: unknown;
  applicantCity?: unknown;
  applicantProfile?: unknown;
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
    de: "Schwerpunkt: Teamfit (Lernkurve, Zuverlässigkeit, Zusammenarbeit).",
    en: "Focus: team fit (learning curve, reliability, collaboration).",
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

function buildSystemPrompt(
  locale: "de" | "en",
  applicantProfile: string,
  hasCustomName: boolean,
): string {
  // A visitor-provided profile replaces the demo persona entirely, so anyone
  // can generate a letter about themselves instead of about Oleksandr.
  if (applicantProfile) {
    if (locale === "de") {
      return [
        "Du bist ein erfahrener Bewerbungscoach für den deutschen Arbeitsmarkt.",
        "Du schreibst ein Anschreiben für die folgende Person. Nutze ausschließlich diese Angaben als Profil:",
        applicantProfile,
        "Regeln: Erfinde keine Abschlüsse, Zeugnisse, Anstellungen, Kunden oder Kenntnisse, die nicht in den Angaben stehen. Vermeide übertriebene Aussagen wie 'idealer Kandidat'.",
        "Struktur: Betreffzeile, Anrede, Einstieg mit Bezug zur Stelle, 2–3 Absätze Passung/Motivation, Abschluss mit Gesprächswunsch, Grußformel.",
        "Länge: 220–320 Wörter. Sprache: Deutsch. Keine Markdown-Formatierung, nur reiner Brieftext.",
      ].join(" ");
    }

    return [
      "You are an experienced application coach for the German job market.",
      "You write a cover letter for the following person. Use only these details as the candidate profile:",
      applicantProfile,
      "Rules: never invent degrees, certificates, employment, clients or skills that are not in the details. Avoid inflated claims such as 'ideal candidate'.",
      "Structure: subject line, salutation, opening tied to the vacancy, 2–3 paragraphs on fit/motivation, closing with interview interest, sign-off.",
      "Length: 220–320 words. Language: English. No markdown formatting, plain letter text only.",
    ].join(" ");
  }

  // A custom name without profile details: write honestly and generically
  // instead of attaching the demo persona's biography to a stranger's name.
  if (hasCustomName) {
    if (locale === "de") {
      return [
        "Du bist ein erfahrener Bewerbungscoach für den deutschen Arbeitsmarkt.",
        "Zum Profil der Person liegen keine Details vor. Schreibe ein ehrliches, konkretes Anschreiben entlang der Anforderungen der Stellenanzeige und der angegebenen Stärken.",
        "Regeln: Erfinde keine konkreten Abschlüsse, Arbeitgeber, Jahreszahlen oder Zertifikate. Vermeide übertriebene Aussagen.",
        "Struktur: Betreffzeile, Anrede, Einstieg mit Bezug zur Stelle, 2–3 Absätze Passung/Motivation, Abschluss mit Gesprächswunsch, Grußformel.",
        "Länge: 220–320 Wörter. Sprache: Deutsch. Keine Markdown-Formatierung, nur reiner Brieftext.",
      ].join(" ");
    }

    return [
      "You are an experienced application coach for the German job market.",
      "No profile details are available for this person. Write an honest, concrete cover letter built around the vacancy requirements and the selected strengths.",
      "Rules: never invent specific degrees, employers, years of experience or certificates. Avoid inflated claims.",
      "Structure: subject line, salutation, opening tied to the vacancy, 2–3 paragraphs on fit/motivation, closing with interview interest, sign-off.",
      "Length: 220–320 words. Language: English. No markdown formatting, plain letter text only.",
    ].join(" ");
  }

  if (locale === "de") {
    return [
      "Du bist ein erfahrener Bewerbungscoach für den deutschen IT-Arbeitsmarkt (QA und Testautomatisierung, Junior bis Mid-Level).",
      "Du schreibst Anschreiben für Oleksandr (Bewerber mit Fokus Browser- und Web-Testautomatisierung, Playwright):",
      "Rund drei Jahre tägliche, KI-gestützte Browser-Automatisierung in eigenen Projekten: mehr als 10.000 isolierte Browserprofile mit eigener Netzwerk-, Identitäts- und Session-Konfiguration, bis zu 10 gleichzeitige Sessions; Verifikation im echten Browser, DevTools- und mitmproxy-Traffic-Analyse. Öffentliche E2E-Suite (Playwright + TypeScript, Page Object Model, API- und Accessibility-Tests) mit GitHub Actions CI gegen Produktion — KI-gestützte Implementierung, Anforderungen/Verifikation/Debugging bei Oleksandr. 1. Platz unter ~6.000 im JS/FE Pre-School-Kurs von RS School / EPAM (stärkste Disziplin: pixelgenaues HTML/CSS); Bachelor Wirtschaftskybernetik (ZAB-anerkannt). Web-Grundlagen ehrlich eingeordnet und in Auffrischung. Ukrainisch/Russisch Muttersprache, Deutsch B1, Englisch im Aufbau.",
      "Regeln: Erfinde keine Abschlüsse, Zeugnisse, Anstellungen, Kunden oder Framework-Expertise. Bezeichne die drei Jahre als eigene, KI-gestützte Automatisierungspraxis — nicht als Berufserfahrung oder jahrelanges eigenständiges Playwright-Programmieren. Vermeide übertriebene Aussagen wie 'idealer Kandidat'. Stelle KI-Kompetenz konkret und verantwortungsvoll dar und bleibe bei diesem Profil.",
      "Struktur: Betreffzeile, Anrede, Einstieg mit Bezug zur Stelle, 2–3 Absätze Passung/Motivation, Abschluss mit Gesprächswunsch, Grußformel.",
      "Länge: 220–320 Wörter. Sprache: Deutsch. Keine Markdown-Formatierung, nur reiner Brieftext.",
    ].join(" ");
  }

  return [
    "You are an experienced application coach for the German IT job market (QA and test automation, junior to mid level).",
    "You write cover letters for Oleksandr (candidate focused on browser and web test automation with Playwright):",
    "around three years of daily, AI-assisted browser automation in personal projects: more than 10,000 isolated browser profiles with their own network, identity and session configuration, up to 10 concurrent sessions; verification in the real browser, DevTools and mitmproxy traffic analysis. Public e2e suite (Playwright + TypeScript, Page Object Model, API and accessibility tests) with GitHub Actions CI against production — AI-assisted implementation with scope, verification and debugging owned by Oleksandr. 1st place among ~6,000 in the RS School / EPAM JS/FE Pre-School course (strongest discipline: pixel-perfect HTML/CSS); bachelor's in Economic Cybernetics (ZAB-recognized). Web fundamentals honestly framed and being refreshed. Ukrainian/Russian native, German B1, English improving.",
    "Rules: never invent degrees, certificates, employment, clients or framework expertise. Describe the three years as personal, AI-assisted automation practice — not as professional employment or years of hand-written Playwright code. Avoid inflated claims such as 'ideal candidate'. Present AI ability concretely and responsibly, and stay within this profile.",
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
      : DEFAULT_APPLICANT;
  const applicantCity =
    typeof payload.applicantCity === "string" ? payload.applicantCity.trim().slice(0, MAX_CITY_CHARS) : "";
  const applicantProfile =
    typeof payload.applicantProfile === "string"
      ? payload.applicantProfile.trim().slice(0, MAX_PROFILE_CHARS)
      : "";
  const hasProfile = applicantProfile.length >= 30;
  const hasCustomName = applicantName !== DEFAULT_APPLICANT;

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
    system: buildSystemPrompt(locale, hasProfile ? applicantProfile : "", hasCustomName),
    messages: [{ role: "user", content: userPrompt }],
    // Reasoning-capable models burn a large hidden thinking budget before the
    // letter itself; the headroom is harmless for plain instruct models.
    maxTokens: 4_000,
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
