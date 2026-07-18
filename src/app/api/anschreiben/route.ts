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

type AnschreibenPayload = {
  vacancyText?: unknown;
  focus?: unknown;
  tone?: unknown;
  strengths?: unknown;
  applicantName?: unknown;
  applicantCity?: unknown;
  applicantProfile?: unknown;
  contactPerson?: unknown;
  letterLength?: unknown;
  locale?: unknown;
  model?: unknown;
};

const LENGTH_HINTS: Record<string, { de: string; en: string }> = {
  short: {
    de: "Länge: 120–180 Wörter, kompakt.",
    en: "Length: 120–180 words, compact.",
  },
  standard: {
    de: "Länge: 220–320 Wörter.",
    en: "Length: 220–320 words.",
  },
  long: {
    de: "Länge: 350–450 Wörter, ausführlich.",
    en: "Length: 350–450 words, detailed.",
  },
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
  lengthHint: string,
): string {
  // The letter is always about the visitor: either strictly from the profile
  // they provided, or honestly generic when only name and vacancy are known.
  if (applicantProfile) {
    if (locale === "de") {
      return [
        "Du bist ein erfahrener Bewerbungscoach für den deutschen Arbeitsmarkt.",
        "Du schreibst ein Anschreiben für die folgende Person. Nutze ausschließlich diese Angaben als Profil:",
        applicantProfile,
        "Regeln: Erfinde keine Abschlüsse, Zeugnisse, Anstellungen, Kunden oder Kenntnisse, die nicht in den Angaben stehen. Vermeide übertriebene Aussagen wie 'idealer Kandidat'.",
        "Struktur: Betreffzeile, Anrede, Einstieg mit Bezug zur Stelle, 2–3 Absätze Passung/Motivation, Abschluss mit Gesprächswunsch, Grußformel.",
        `${lengthHint} Sprache: Deutsch. Keine Markdown-Formatierung, nur reiner Brieftext.`,
      ].join(" ");
    }

    return [
      "You are an experienced application coach for the German job market.",
      "You write a cover letter for the following person. Use only these details as the candidate profile:",
      applicantProfile,
      "Rules: never invent degrees, certificates, employment, clients or skills that are not in the details. Avoid inflated claims such as 'ideal candidate'.",
      "Structure: subject line, salutation, opening tied to the vacancy, 2–3 paragraphs on fit/motivation, closing with interview interest, sign-off.",
      `${lengthHint} Language: English. No markdown formatting, plain letter text only.`,
    ].join(" ");
  }

  if (locale === "de") {
    return [
      "Du bist ein erfahrener Bewerbungscoach für den deutschen Arbeitsmarkt.",
      "Zum Profil der Person liegen keine Details vor. Schreibe ein ehrliches, konkretes Anschreiben entlang der Anforderungen der Stellenanzeige und der angegebenen Stärken.",
      "Regeln: Erfinde keine konkreten Abschlüsse, Arbeitgeber, Jahreszahlen oder Zertifikate. Vermeide übertriebene Aussagen.",
      "Struktur: Betreffzeile, Anrede, Einstieg mit Bezug zur Stelle, 2–3 Absätze Passung/Motivation, Abschluss mit Gesprächswunsch, Grußformel.",
      `${lengthHint} Sprache: Deutsch. Keine Markdown-Formatierung, nur reiner Brieftext.`,
    ].join(" ");
  }

  return [
    "You are an experienced application coach for the German job market.",
    "No profile details are available for this person. Write an honest, concrete cover letter built around the vacancy requirements and the selected strengths.",
    "Rules: never invent specific degrees, employers, years of experience or certificates. Avoid inflated claims.",
    "Structure: subject line, salutation, opening tied to the vacancy, 2–3 paragraphs on fit/motivation, closing with interview interest, sign-off.",
    `${lengthHint} Language: English. No markdown formatting, plain letter text only.`,
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
    typeof payload.applicantName === "string" ? payload.applicantName.trim().slice(0, MAX_NAME_CHARS) : "";
  const applicantCity =
    typeof payload.applicantCity === "string" ? payload.applicantCity.trim().slice(0, MAX_CITY_CHARS) : "";
  const applicantProfile =
    typeof payload.applicantProfile === "string"
      ? payload.applicantProfile.trim().slice(0, MAX_PROFILE_CHARS)
      : "";
  const hasProfile = applicantProfile.length >= 30;
  const contactPerson =
    typeof payload.contactPerson === "string" ? payload.contactPerson.trim().slice(0, MAX_NAME_CHARS) : "";
  const lengthHint =
    (LENGTH_HINTS[typeof payload.letterLength === "string" ? payload.letterLength : ""] ?? LENGTH_HINTS.standard)[
      locale
    ];

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
    applicantName
      ? locale === "de"
        ? `Name des Bewerbers: ${applicantName}.`
        : `Applicant name: ${applicantName}.`
      : locale === "de"
        ? "Kein Name angegeben — beende den Brief mit dem Platzhalter [Vor- und Nachname]."
        : "No name provided — end the letter with the placeholder [First Last].",
    contactPerson
      ? locale === "de"
        ? `Ansprechpartner:in für die Anrede: ${contactPerson}.`
        : `Address the salutation to: ${contactPerson}.`
      : "",
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
    system: buildSystemPrompt(locale, hasProfile ? applicantProfile : "", lengthHint),
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
