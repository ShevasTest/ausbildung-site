"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { decodeLlmLabel } from "@/lib/llm-label";
import { extractCompany, extractRole } from "@/lib/vacancy-analysis";

type LocaleKey = "de" | "en";
type FocusKey = "frontend" | "fullstack" | "teamfit" | "ai";
type ToneKey = "professional" | "motivated" | "direct";
type LengthKey = "short" | "standard" | "long";

type VacancyPreset = {
  id: string;
  label: string;
  focus: FocusKey;
  text: string;
};

type OptionItem<TValue extends string> = {
  value: TValue;
  label: string;
  hint: string;
};

type StrengthItem = {
  id: string;
  label: string;
};

type DemoCopy = {
  badge: string;
  title: string;
  subtitle: string;
  back: string;
  chips: string[];
  input: {
    title: string;
    hint: string;
    placeholder: string;
    characters: string;
    nameLabel: string;
    namePlaceholder: string;
    cityLabel: string;
    cityPlaceholder: string;
    profileLabel: string;
    profilePlaceholder: string;
    profileHint: string;
    contactLabel: string;
    contactPlaceholder: string;
    letterLanguageLabel: string;
    letterLanguageOptions: { value: "de" | "en"; label: string }[];
    lengthLabel: string;
    lengthOptions: { value: LengthKey; label: string }[];
    presetsLabel: string;
    focusLabel: string;
    toneLabel: string;
    modelLabel: string;
    modelHint: string;
    modelLoading: string;
    modelUnavailable: string;
    strengthsLabel: string;
    strengthsHint: string;
    generate: string;
    generating: string;
    errorRequired: string;
    errorName: string;
    errorProfile: string;
  };
  output: {
    title: string;
    copy: string;
    copied: string;
    copyError: string;
    emptyTitle: string;
    emptyText: string;
    statusIdle: string;
    statusAnalyzing: string;
    statusDrafting: string;
    statusPolishing: string;
    statusDone: string;
    generatedAt: string;
  };
  analysis: {
    title: string;
    company: string;
    role: string;
    keywords: string;
    argument: string;
    unknownCompany: string;
    fallbackRole: string;
    noKeywords: string;
  };
  footerNote: string;
  footerNoteAvailable: string;
  footerNoteLive: string;
  aiModeNote: string;
  aiModeNoteAvailable: string;
  aiModeNoteLive: string;
  statusLive: string;
  statusDemo: string;
  presets: VacancyPreset[];
  focusOptions: OptionItem<FocusKey>[];
  toneOptions: OptionItem<ToneKey>[];
  strengths: StrengthItem[];
  focusParagraphs: Record<FocusKey, string>;
  toneOpeners: Record<ToneKey, string>;
  strengthSentences: Record<string, string>;
};

type KIBewerbungshelferDemoProps = {
  locale: string;
};

type AvailableModel = {
  id: string;
  label: string;
};

type VacancyAnalysis = {
  company: string;
  role: string;
  keywords: string[];
  argumentLabel: string;
};

const COPY: Record<LocaleKey, DemoCopy> = {
  de: {
    badge: "Live-Demo · KI-Bewerbungshelfer",
    title: "KI-Bewerbungshelfer",
    subtitle:
      "Stellenanzeige einfügen, optional das eigene Profil angeben, Fokus setzen — Anschreiben generieren. Die Ausgabe kommt als Streaming-Text von einem echten Sprachmodell über eine eigene Server-Route — ohne konfigurierten API-Key läuft automatisch ein lokaler Demo-Modus.",
    back: "Zurück zur Startseite",
    chips: ["Streaming-Ausgabe", "HR-taugliche Formulierungen", "Echte KI · Demo-Fallback"],
    input: {
      title: "Stellenanzeige einfügen",
      hint: "Verwenden Sie den Originaltext der Ausschreibung. Der Helfer extrahiert Rolle, Keywords und passende Argumentation.",
      placeholder:
        "Beispiel: Wir suchen einen Junior Frontend Developer (m/w/d) für unser Produktteam in Berlin ...",
      characters: "Zeichen",
      presetsLabel: "Schnellstart-Vorlagen",
      focusLabel: "Fokus im Anschreiben",
      toneLabel: "Ton",
      modelLabel: "KI-Modell",
      modelHint: "Kostenlose Modelle — die Liste passt sich automatisch an die aktuell verfügbaren Modelle an.",
      modelLoading: "Verfügbare KI-Modelle werden geladen …",
      modelUnavailable: "Lokaler Demo-Modus · Groq/OpenRouter nicht konfiguriert",
      strengthsLabel: "Persönliche Stärken hervorheben",
      strengthsHint: "Maximal 3 auswählen",
      nameLabel: "Ihr Name",
      namePlaceholder: "z.B. Max Mustermann",
      cityLabel: "Ihr Standort",
      cityPlaceholder: "z.B. München",
      profileLabel: "Ihr Profil",
      profilePlaceholder:
        "Ausbildung, Erfahrung, Kenntnisse, Stärken — Stichpunkte reichen. Das Anschreiben nutzt dann nur Ihre Angaben.",
      profileHint:
        "Das Anschreiben wird ausschließlich aus Ihren Angaben geschrieben. Bitte keine sensiblen Daten eingeben.",
      contactLabel: "Ansprechpartner:in (optional)",
      contactPlaceholder: "z.B. Frau Müller",
      letterLanguageLabel: "Sprache des Anschreibens",
      letterLanguageOptions: [
        { value: "de", label: "Deutsch" },
        { value: "en", label: "Englisch" },
      ],
      lengthLabel: "Länge",
      lengthOptions: [
        { value: "short", label: "Kurz (~150)" },
        { value: "standard", label: "Standard" },
        { value: "long", label: "Ausführlich" },
      ],
      generate: "Anschreiben generieren",
      generating: "Generiere Anschreiben ...",
      errorRequired: "Bitte zuerst eine Stellenanzeige einfügen.",
      errorName: "Bitte geben Sie Ihren Namen ein.",
      errorProfile: "Bitte beschreiben Sie kurz Ihr Profil (mindestens 30 Zeichen) — das Anschreiben entsteht nur aus Ihren Angaben.",
    },
    output: {
      title: "Generiertes Anschreiben",
      copy: "Kopieren",
      copied: "Kopiert",
      copyError: "Fehler",
      emptyTitle: "Noch kein Anschreiben erstellt",
      emptyText:
        "Füllen Sie links den Stellentext aus und starten Sie die Generierung. Rechts erscheint ein gestreamter Entwurf mit sauberem Aufbau.",
      statusIdle: "Bereit für Analyse",
      statusAnalyzing: "Analysiere Stellenanzeige ...",
      statusDrafting: "Erstelle ersten Entwurf ...",
      statusPolishing: "Optimiere Formulierungen ...",
      statusDone: "Fertig — bereit zum Kopieren",
      generatedAt: "Generiert um",
    },
    analysis: {
      title: "Schnellanalyse",
      company: "Unternehmen",
      role: "Rolle",
      keywords: "Erkannte Keywords",
      argument: "Argumentationsfokus",
      unknownCompany: "Ihr Unternehmen",
      fallbackRole: "die ausgeschriebene Position",
      noKeywords: "Noch keine klaren Keywords erkannt",
    },
    footerNote:
      "Hinweis: Aktuell läuft der lokale Demo-Modus (kein API-Key auf dem Server konfiguriert). Aufbau, Streaming und Analyse funktionieren identisch — mit API-Key schreibt ein echtes Sprachmodell.",
    footerNoteAvailable:
      "Hinweis: Live-Modelle sind verfügbar. Bei der Generierung wird das ausgewählte Modell über eine Server-Route mit Rate-Limit verwendet. Bitte prüfen Sie den Text vor dem Versand und geben Sie keine sensiblen Daten ein.",
    footerNoteLive:
      "Hinweis: Das Anschreiben wird von einem echten Sprachmodell über eine Server-Route mit Rate-Limit generiert. Bitte prüfen Sie den Text vor dem Versand und geben Sie keine sensiblen Daten ein.",
    aiModeNote: "KI-Modus: Lokaler Demo-Generator (kein externes LLM)",
    aiModeNoteAvailable: "KI-Modus: Live-Modelle verfügbar",
    aiModeNoteLive: "KI-Modus: Live — echtes Sprachmodell über Server-Route",
    statusLive: "Live-KI",
    statusDemo: "Demo-Modus",
    presets: [
      {
        id: "preset-qa-testing",
        label: "QA / Test Automation",
        focus: "ai",
        text:
          "Ein Softwarehaus in Frankfurt sucht einen Junior QA Automation Developer (m/w/d). Aufgaben sind Testfall-Design, automatisierte UI/API-Tests, Fehleranalyse und Zusammenarbeit mit Dev-Teams. Vorteilhaft: Interesse an Testing-Tools, CI und genauer Dokumentation.",
      },
      {
        id: "preset-startup-frontend",
        label: "Start-up Frontend (Berlin)",
        focus: "frontend",
        text:
          "Ein Berliner SaaS-Start-up sucht einen Junior Frontend Developer (m/w/d). Du entwickelst im Produktteam Features mit React, Next.js und TypeScript, arbeitest eng mit Product und Design zusammen und verbesserst UX sowie Ladezeiten. Wichtig sind Lernbereitschaft, saubere Kommunikation und ein nachvollziehbarer Entwicklungsprozess.",
      },
    ],
    focusOptions: [
      {
        value: "frontend",
        label: "Frontend & UX",
        hint: "Responsive UI, Accessibility, Performance",
      },
      {
        value: "fullstack",
        label: "Full-Stack-Orientierung",
        hint: "API-Denken, Datenfluss, saubere Schnittstellen",
      },
      {
        value: "teamfit",
        label: "Team-Fit & Junior-Rolle",
        hint: "Lernkurve, Zuverlässigkeit, Zusammenarbeit",
      },
      {
        value: "ai",
        label: "KI-Produktivität",
        hint: "Automatisierung, strukturierte Prompt-Workflows",
      },
    ],
    toneOptions: [
      {
        value: "professional",
        label: "Professionell",
        hint: "Klar, sachlich, HR-sicher",
      },
      {
        value: "motivated",
        label: "Motiviert",
        hint: "Mehr Energie, starke Eigeninitiative",
      },
      {
        value: "direct",
        label: "Direkt",
        hint: "Kompakt, selbstbewusst, auf den Punkt",
      },
    ],
    strengths: [
      { id: "initiative", label: "Eigeninitiative" },
      { id: "learning", label: "Schnelle Lernkurve" },
      { id: "structure", label: "Strukturierte Arbeitsweise" },
      { id: "team", label: "Teamorientierung" },
      { id: "communication", label: "Klare Kommunikation" },
    ],
    focusParagraphs: {
      frontend:
        "Besonders reizt mich die Arbeit an nutzerfreundlichen, zugänglichen Oberflächen — mit Blick auf Details, Performance und ein konsistentes Nutzererlebnis.",
      fullstack:
        "Mich motiviert das Zusammenspiel aus Frontend, APIs und Datenflüssen: Anforderungen zerlegen, Schnittstellen sauber verbinden und Lösungen Schritt für Schritt zu einem stabilen Ergebnis führen.",
      teamfit:
        "Ich suche ein Team, in dem ich Verantwortung übernehme, Feedback schnell umsetze und mich fachlich wie persönlich weiterentwickeln kann.",
      ai:
        "KI-Tools setze ich produktiv und verantwortungsvoll ein: als Beschleuniger für Routineaufgaben, deren Ergebnisse ich konsequent prüfe und nachvollziehbar dokumentiere.",
    },
    toneOpeners: {
      professional:
        "mit großem Interesse habe ich Ihre Ausschreibung gelesen und möchte mich hiermit um die Position bewerben.",
      motivated:
        "Ihre Ausschreibung hat mich sofort angesprochen, weil sie genau den Mix aus Praxis, Lernkurve und Verantwortung beschreibt, den ich suche.",
      direct:
        "ich bewerbe mich gezielt auf diese Position, weil mein Profil fachlich und von der Arbeitsweise sehr gut zu Ihren Anforderungen passt.",
    },
    strengthSentences: {
      initiative:
        "Eigeninitiative zeige ich, indem ich Aufgaben aktiv aufgreife, mich selbstständig einarbeite und Dinge zuverlässig zu Ende führe.",
      learning:
        "Neue Technologien und Arbeitsweisen eigne ich mir schnell an und setze Feedback direkt in konkrete Verbesserungen um.",
      structure:
        "Ich arbeite strukturiert, dokumentiere nachvollziehbar und behalte auch unter Zeitdruck Prioritäten im Blick.",
      team:
        "In der Zusammenarbeit bin ich verlässlich, hilfsbereit und orientiere mich an gemeinsamen Zielen statt Einzelinteressen.",
      communication:
        "Technische Inhalte kann ich präzise und verständlich kommunizieren — sowohl im Team als auch gegenüber nicht-technischen Stakeholdern.",
    },
  },
  en: {
    badge: "Live demo · AI Application Assistant",
    title: "AI Application Assistant",
    subtitle:
      "Paste a job description, optionally add your own profile, set the focus — and generate a cover letter. The output streams from a real language model through a dedicated server route — without a configured API key the demo automatically falls back to a local mode.",
    back: "Back to homepage",
    chips: ["Streaming output", "HR-ready wording", "Real AI · demo fallback"],
    input: {
      title: "Paste job description",
      hint: "Use the original vacancy text. The assistant extracts role, keywords and argument strategy.",
      placeholder:
        "Example: We are hiring a junior frontend developer (m/f/d) for our product team in Berlin ...",
      characters: "characters",
      presetsLabel: "Quick presets",
      focusLabel: "Cover letter focus",
      toneLabel: "Tone",
      modelLabel: "AI model",
      modelHint: "Free models — the list adapts automatically to what is currently available.",
      modelLoading: "Loading available AI models …",
      modelUnavailable: "Local demo mode · Groq/OpenRouter not configured",
      strengthsLabel: "Highlight strengths",
      strengthsHint: "Select up to 3",
      nameLabel: "Your name",
      namePlaceholder: "e.g. John Smith",
      cityLabel: "Your location",
      cityPlaceholder: "e.g. Munich",
      profileLabel: "Your profile",
      profilePlaceholder:
        "Education, experience, skills, strengths — bullet points are fine. The letter will then use only your details.",
      profileHint:
        "The cover letter is written exclusively from your details. Please do not enter sensitive data.",
      contactLabel: "Contact person (optional)",
      contactPlaceholder: "e.g. Ms. Miller",
      letterLanguageLabel: "Letter language",
      letterLanguageOptions: [
        { value: "de", label: "German" },
        { value: "en", label: "English" },
      ],
      lengthLabel: "Length",
      lengthOptions: [
        { value: "short", label: "Short (~150)" },
        { value: "standard", label: "Standard" },
        { value: "long", label: "Detailed" },
      ],
      generate: "Generate cover letter",
      generating: "Generating cover letter ...",
      errorRequired: "Please paste a job description first.",
      errorName: "Please enter your name.",
      errorProfile: "Please describe your profile briefly (at least 30 characters) — the letter is written only from your details.",
    },
    output: {
      title: "Generated cover letter",
      copy: "Copy",
      copied: "Copied",
      copyError: "Error",
      emptyTitle: "No cover letter yet",
      emptyText:
        "Fill in the vacancy text on the left and start generation. The right panel will stream a structured draft.",
      statusIdle: "Ready to analyze",
      statusAnalyzing: "Analyzing vacancy ...",
      statusDrafting: "Building first draft ...",
      statusPolishing: "Polishing wording ...",
      statusDone: "Done — ready to copy",
      generatedAt: "Generated at",
    },
    analysis: {
      title: "Quick analysis",
      company: "Company",
      role: "Role",
      keywords: "Detected keywords",
      argument: "Argument focus",
      unknownCompany: "your company",
      fallbackRole: "the advertised role",
      noKeywords: "No clear keywords detected yet",
    },
    footerNote:
      "Note: the local demo mode is active (no API key configured on the server). Structure, streaming and analysis behave identically — with an API key a real language model writes the letter.",
    footerNoteAvailable:
      "Note: live models are available. Generation uses the selected model through a rate-limited server route. Review the result before sending and do not enter sensitive data.",
    footerNoteLive:
      "Note: the cover letter is generated by a real language model through a rate-limited server route. Please review the text before sending and do not enter sensitive data.",
    aiModeNote: "AI mode: local demo generator (no external LLM)",
    aiModeNoteAvailable: "AI mode: live models available",
    aiModeNoteLive: "AI mode: live — real language model via server route",
    statusLive: "Live AI",
    statusDemo: "Demo mode",
    presets: [
      {
        id: "preset-qa-testing",
        label: "QA / test automation",
        focus: "ai",
        text:
          "A software company in Frankfurt is hiring a junior QA automation developer. Responsibilities include test case design, automated UI/API testing, bug triage and collaboration with developers. Interest in testing tools, CI pipelines and precise documentation is a plus.",
      },
      {
        id: "preset-startup-frontend",
        label: "Startup frontend (Berlin)",
        focus: "frontend",
        text:
          "A Berlin SaaS startup is hiring a junior frontend developer (m/f/d). You will build product-facing features with React, Next.js and TypeScript, collaborate with product/design and improve UX and page performance. We value willingness to learn, clear communication and a traceable development process.",
      },
    ],
    focusOptions: [
      {
        value: "frontend",
        label: "Frontend & UX",
        hint: "Responsive UI, accessibility, performance",
      },
      {
        value: "fullstack",
        label: "Full-stack mindset",
        hint: "API thinking, data flow, integration quality",
      },
      {
        value: "teamfit",
        label: "Team fit & junior role",
        hint: "Learning speed, reliability, collaboration",
      },
      {
        value: "ai",
        label: "AI productivity",
        hint: "Automation and structured prompting",
      },
    ],
    toneOptions: [
      {
        value: "professional",
        label: "Professional",
        hint: "Formal and clear",
      },
      {
        value: "motivated",
        label: "Motivated",
        hint: "More energy and ownership",
      },
      {
        value: "direct",
        label: "Direct",
        hint: "Compact and confident",
      },
    ],
    strengths: [
      { id: "initiative", label: "Initiative" },
      { id: "learning", label: "Fast learner" },
      { id: "structure", label: "Structured execution" },
      { id: "team", label: "Team player" },
      { id: "communication", label: "Clear communication" },
    ],
    focusParagraphs: {
      frontend:
        "I am particularly drawn to building user-friendly, accessible interfaces — with attention to detail, performance and a consistent user experience.",
      fullstack:
        "I enjoy the interplay of frontend, APIs and data flows: breaking down requirements, connecting interfaces cleanly and guiding solutions step by step to a stable result.",
      teamfit:
        "I am looking for a team where I can take ownership, act on feedback quickly and keep growing professionally and personally.",
      ai:
        "I use AI tools productively and responsibly: as an accelerator for routine work whose results I consistently verify and document.",
    },
    toneOpeners: {
      professional:
        "I have read your job posting with great interest and would like to apply for this role.",
      motivated:
        "Your posting immediately resonated with me because it combines practical product work, learning growth and responsibility.",
      direct: "I am applying for this role because my skills and work style are a strong match for your requirements.",
    },
    strengthSentences: {
      initiative:
        "I show initiative by taking on tasks proactively, learning independently and reliably following through.",
      learning:
        "I learn new technologies quickly and turn feedback into concrete improvements without delay.",
      structure:
        "I work in a structured way, document clearly and keep priorities visible even under time pressure.",
      team:
        "In collaboration, I am reliable and supportive, focusing on shared outcomes instead of individual spotlight.",
      communication:
        "I communicate technical topics clearly to both technical teammates and non-technical stakeholders.",
    },
  },
};

type KeywordEntry = {
  match: string;
  labelDe: string;
  labelEn: string;
};

const KEYWORD_LIBRARY: KeywordEntry[] = [
  { match: "next.js", labelDe: "Next.js", labelEn: "Next.js" },
  { match: "nextjs", labelDe: "Next.js", labelEn: "Next.js" },
  { match: "react", labelDe: "React", labelEn: "React" },
  { match: "typescript", labelDe: "TypeScript", labelEn: "TypeScript" },
  { match: "javascript", labelDe: "JavaScript", labelEn: "JavaScript" },
  { match: "api", labelDe: "API", labelEn: "API" },
  { match: "rest", labelDe: "REST", labelEn: "REST" },
  { match: "sql", labelDe: "SQL", labelEn: "SQL" },
  { match: "datenbank", labelDe: "Datenbanken", labelEn: "Databases" },
  { match: "database", labelDe: "Datenbanken", labelEn: "Databases" },
  { match: "ux", labelDe: "UX", labelEn: "UX" },
  { match: "accessibility", labelDe: "Accessibility", labelEn: "Accessibility" },
  { match: "barriere", labelDe: "Barrierefreiheit", labelEn: "Accessibility" },
  { match: "performance", labelDe: "Performance", labelEn: "Performance" },
  { match: "team", labelDe: "Teamarbeit", labelEn: "Teamwork" },
  { match: "agil", labelDe: "Agile Arbeitsweise", labelEn: "Agile" },
  { match: "agile", labelDe: "Agile Arbeitsweise", labelEn: "Agile" },
  { match: "dokumentation", labelDe: "Dokumentation", labelEn: "Documentation" },
  { match: "cloud", labelDe: "Cloud", labelEn: "Cloud" },
  { match: "python", labelDe: "Python", labelEn: "Python" },
  { match: "node", labelDe: "Node.js", labelEn: "Node.js" },
];

function extractKeywords(vacancyText: string, localeKey: LocaleKey) {
  const lowered = vacancyText.toLowerCase();
  const found: string[] = [];

  for (const entry of KEYWORD_LIBRARY) {
    if (!lowered.includes(entry.match)) {
      continue;
    }

    const label = localeKey === "de" ? entry.labelDe : entry.labelEn;

    if (!found.includes(label)) {
      found.push(label);
    }

    if (found.length >= 7) {
      break;
    }
  }

  return found;
}

function buildGermanLetter(params: {
  analysis: VacancyAnalysis;
  tone: ToneKey;
  focus: FocusKey;
  strengths: string[];
  copy: DemoCopy;
  applicantName: string;
  applicantCity: string;
  applicantProfile: string;
}) {
  const { analysis, tone, focus, strengths, copy, applicantName, applicantCity, applicantProfile } = params;
  const profileParagraph = applicantProfile
    ? `Kurz zu meinem Hintergrund: ${applicantProfile.replace(/\s+/g, " ").trim()}`
    : "";
  const salutation =
    analysis.company === copy.analysis.unknownCompany
      ? "Sehr geehrtes Recruiting-Team,"
      : `Sehr geehrtes Recruiting-Team der ${analysis.company},`;

  const keywordLine =
    analysis.keywords.length > 0
      ? `Aus Ihrer Ausschreibung sind für mich insbesondere ${analysis.keywords
          .slice(0, 4)
          .join(", ")} als zentrale Anforderungen erkennbar — genau in diesen Themenfeldern habe ich in meinen Projekten bereits praxisnah gearbeitet.`
      : "Besonders überzeugt mich, dass Sie auf Lernbereitschaft, saubere Umsetzung und Zusammenarbeit setzen — genau dafür stehe ich in meiner täglichen Arbeit.";

  const selectedStrengths = strengths
    .map((strength) => copy.strengthSentences[strength])
    .filter((sentence): sentence is string => Boolean(sentence));

  const strengthParagraph =
    selectedStrengths.length > 0
      ? selectedStrengths.join(" ")
      : "Ich arbeite eigenverantwortlich, denke mit und entwickle Lösungen so, dass sie im Team langfristig wartbar bleiben.";

  const cityLine = applicantCity ? `${applicantCity}, den ${new Date().toLocaleDateString("de-DE")}` : "";

  return [
    ...(cityLine ? [cityLine, ""] : []),
    `Betreff: Bewerbung um ${analysis.role}`,
    "",
    salutation,
    "",
    copy.toneOpeners[tone],
    "",
    ...(profileParagraph ? [profileParagraph, ""] : []),
    copy.focusParagraphs[focus],
    "",
    keywordLine,
    "",
    strengthParagraph,
    "",
    "Über die Möglichkeit, mich persönlich vorzustellen und mehr über Ihr Team zu erfahren, freue ich mich sehr.",
    "",
    "Mit freundlichen Grüßen",
    applicantName,
    "",
    "Anlage: Lebenslauf",
  ].join("\n");
}

function buildEnglishLetter(params: {
  analysis: VacancyAnalysis;
  tone: ToneKey;
  focus: FocusKey;
  strengths: string[];
  copy: DemoCopy;
  applicantName: string;
  applicantCity: string;
  applicantProfile: string;
}) {
  const { analysis, tone, focus, strengths, copy, applicantName, applicantCity, applicantProfile } = params;
  const profileParagraph = applicantProfile
    ? `A little about my background: ${applicantProfile.replace(/\s+/g, " ").trim()}`
    : "";
  const salutation =
    analysis.company === copy.analysis.unknownCompany
      ? "Dear recruiting team,"
      : `Dear recruiting team at ${analysis.company},`;

  const keywordLine =
    analysis.keywords.length > 0
      ? `From your vacancy text, I identified ${analysis.keywords
          .slice(0, 4)
          .join(", ")} as key priorities. These are exactly the areas where I already built practical project experience.`
      : "I value your focus on learning mindset, implementation quality and collaborative teamwork — this aligns strongly with how I work.";

  const selectedStrengths = strengths
    .map((strength) => copy.strengthSentences[strength])
    .filter((sentence): sentence is string => Boolean(sentence));

  const strengthParagraph =
    selectedStrengths.length > 0
      ? selectedStrengths.join(" ")
      : "I work with ownership, think in product context and keep implementation details maintainable for team collaboration.";

  const dateLine = applicantCity
    ? `${applicantCity}, ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
    : "";

  return [
    ...(dateLine ? [dateLine, ""] : []),
    `Subject: Application for ${analysis.role}`,
    "",
    salutation,
    "",
    copy.toneOpeners[tone],
    "",
    ...(profileParagraph ? [profileParagraph, ""] : []),
    copy.focusParagraphs[focus],
    "",
    keywordLine,
    "",
    strengthParagraph,
    "",
    "I would value the opportunity to introduce myself in a personal interview and learn more about your team.",
    "",
    "Kind regards,",
    applicantName,
  ].join("\n");
}

function createAnalysis(copy: DemoCopy, vacancyText: string, focus: FocusKey, localeKey: LocaleKey): VacancyAnalysis {
  const company = extractCompany(vacancyText) || copy.analysis.unknownCompany;
  const role = extractRole(vacancyText, copy.analysis.fallbackRole, localeKey);
  const keywords = extractKeywords(vacancyText, localeKey);

  const argumentLabel =
    copy.focusOptions.find((item) => item.value === focus)?.label ?? copy.focusOptions[0]?.label ?? "";

  return {
    company,
    role,
    keywords,
    argumentLabel,
  };
}

export function KIBewerbungshelferDemo({ locale }: KIBewerbungshelferDemoProps) {
  const localeKey: LocaleKey = locale === "de" ? "de" : "en";
  const copy = COPY[localeKey];

  const [vacancyText, setVacancyText] = useState(copy.presets[0]?.text ?? "");
  const [focus, setFocus] = useState<FocusKey>(copy.presets[0]?.focus ?? "frontend");
  const [tone, setTone] = useState<ToneKey>("professional");
  const [applicantName, setApplicantName] = useState("");
  const [applicantCity, setApplicantCity] = useState("");
  const [applicantProfile, setApplicantProfile] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [letterLanguage, setLetterLanguage] = useState<"de" | "en">(localeKey);
  const [letterLength, setLetterLength] = useState<LengthKey>("standard");
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([
    copy.strengths[0]?.id ?? "initiative",
    copy.strengths[2]?.id ?? "structure",
  ]);

  const [inputError, setInputError] = useState<string>("");
  const [targetText, setTargetText] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [engineMode, setEngineMode] = useState<"unknown" | "live" | "demo">("unknown");
  const [engineLabel, setEngineLabel] = useState("");
  const [isLiveRun, setIsLiveRun] = useState(false);
  const [models, setModels] = useState<AvailableModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [modelsLoading, setModelsLoading] = useState(true);

  const streamTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current !== null) {
        window.clearTimeout(streamTimerRef.current);
      }
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/models", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { models?: AvailableModel[] } | null) => {
        if (cancelled || !data?.models || data.models.length === 0) {
          return;
        }
        setModels(data.models);
        setSelectedModel((current) => current || data.models![0].id);
      })
      .catch(() => {
        // Without a model list the demo silently stays in local mode.
      })
      .finally(() => {
        if (!cancelled) {
          setModelsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const analysis = useMemo(
    () => createAnalysis(copy, vacancyText, focus, localeKey),
    [copy, focus, localeKey, vacancyText],
  );

  const progress = isLiveRun
    ? isGenerating
      ? Math.min(0.92, streamedText.length / 1500)
      : streamedText.length > 0
        ? 1
        : 0
    : targetText.length > 0
      ? streamedText.length / targetText.length
      : 0;
  const statusText = useMemo(() => {
    if (!targetText && !streamedText && !isGenerating) {
      return copy.output.statusIdle;
    }

    if (!isGenerating) {
      return copy.output.statusDone;
    }

    if (progress < 0.28) {
      return copy.output.statusAnalyzing;
    }

    if (progress < 0.72) {
      return copy.output.statusDrafting;
    }

    return copy.output.statusPolishing;
  }, [copy.output, isGenerating, progress, targetText, streamedText]);

  const generatedAtValue = generatedAt
    ? new Intl.DateTimeFormat(localeKey === "de" ? "de-DE" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(generatedAt)
    : null;

  const handlePreset = (preset: VacancyPreset) => {
    setVacancyText(preset.text);
    setFocus(preset.focus);
    setInputError("");
  };

  const toggleStrength = (id: string) => {
    setSelectedStrengths((previous) => {
      if (previous.includes(id)) {
        const next = previous.filter((item) => item !== id);
        return next.length > 0 ? next : previous;
      }

      if (previous.length >= 3) {
        return [...previous.slice(1), id];
      }

      return [...previous, id];
    });
  };

  const streamText = (value: string) => {
    if (streamTimerRef.current !== null) {
      window.clearTimeout(streamTimerRef.current);
    }

    setTargetText(value);
    setStreamedText("");
    setGeneratedAt(null);
    setIsGenerating(true);

    let cursor = 0;

    const tick = () => {
      cursor = Math.min(value.length, cursor + Math.max(3, Math.floor(Math.random() * 8)));
      setStreamedText(value.slice(0, cursor));

      if (cursor >= value.length) {
        setIsGenerating(false);
        setGeneratedAt(new Date());
        return;
      }

      streamTimerRef.current = window.setTimeout(tick, 14 + Math.floor(Math.random() * 26));
    };

    tick();
  };

  const runLocalFallback = (trimmed: string) => {
    setIsLiveRun(false);
    setEngineMode("demo");
    setEngineLabel("");

    const nextAnalysis = createAnalysis(copy, trimmed, focus, localeKey);
    const generated =
      localeKey === "de"
        ? buildGermanLetter({
            analysis: nextAnalysis,
            tone,
            focus,
            strengths: selectedStrengths,
            copy,
            applicantName: applicantName.trim(),
            applicantCity: applicantCity.trim(),
            applicantProfile: applicantProfile.trim(),
          })
        : buildEnglishLetter({
            analysis: nextAnalysis,
            tone,
            focus,
            strengths: selectedStrengths,
            copy,
            applicantName: applicantName.trim(),
            applicantCity: applicantCity.trim(),
            applicantProfile: applicantProfile.trim(),
          });

    streamText(generated);
  };

  const handleGenerate = async () => {
    const trimmed = vacancyText.trim();
    if (!trimmed) {
      setInputError(copy.input.errorRequired);
      return;
    }
    if (!applicantName.trim()) {
      setInputError(copy.input.errorName);
      return;
    }
    if (applicantProfile.trim().length < 30) {
      setInputError(copy.input.errorProfile);
      return;
    }

    setInputError("");
    setCopyState("idle");

    // Live path: real language model via the server route, streaming into the panel.
    setIsLiveRun(true);
    setTargetText("");
    setStreamedText("");
    setGeneratedAt(null);
    setIsGenerating(true);

    const strengthLabels = selectedStrengths
      .map((id) => copy.strengths.find((strength) => strength.id === id)?.label)
      .filter((label): label is string => Boolean(label));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/anschreiben", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyText: trimmed,
          focus,
          tone,
          strengths: strengthLabels,
          applicantName: applicantName.trim(),
          applicantCity: applicantCity.trim(),
          applicantProfile: applicantProfile.trim(),
          contactPerson: contactPerson.trim(),
          letterLength,
          locale: letterLanguage,
          model: selectedModel || undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        runLocalFallback(trimmed);
        return;
      }

      setEngineMode("live");
      setEngineLabel(decodeLlmLabel(response.headers.get("X-Llm-Label")));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        accumulated += decoder.decode(value, { stream: true });
        setStreamedText(accumulated);
      }

      if (accumulated.trim().length === 0) {
        runLocalFallback(trimmed);
        return;
      }

      setTargetText(accumulated);
      setIsGenerating(false);
      setGeneratedAt(new Date());
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setIsGenerating(false);
        return;
      }

      runLocalFallback(trimmed);
    } finally {
      abortRef.current = null;
    }
  };

  const handleCopy = async () => {
    const textToCopy = streamedText || targetText;
    if (!textToCopy.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    window.setTimeout(() => {
      setCopyState("idle");
    }, 1600);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-12">
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {copy.badge}
          </span>
          {engineMode === "live" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] text-accent uppercase">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              {copy.statusLive}
              {engineLabel ? ` · ${engineLabel}` : ""}
            </span>
          ) : engineMode === "demo" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-muted" />
              {copy.statusDemo}
            </span>
          ) : null}
          <Link
            href="/#projects"
            className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            ← {copy.back}
          </Link>
        </div>

        <h1 className="font-display mt-4 text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-4xl text-[0.98rem] leading-relaxed text-muted sm:text-base">{copy.subtitle}</p>

        <ul className="mt-5 flex flex-wrap gap-2.5">
          {copy.chips.map((chip) => (
            <li key={chip} className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-muted">
              {chip}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight">{copy.input.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{copy.input.hint}</p>

          <label htmlFor="vacancy-input" className="mt-4 block text-sm font-semibold text-foreground">
            {copy.input.title}
          </label>
          <textarea
            id="vacancy-input"
            value={vacancyText}
            onChange={(event) => {
              setVacancyText(event.target.value);
              if (inputError) {
                setInputError("");
              }
            }}
            placeholder={copy.input.placeholder}
            rows={11}
            className="contact-field mt-2 w-full resize-y rounded-2xl px-3.5 py-3 text-sm"
          />

          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>{copy.input.characters}</span>
            <span className="font-mono">{vacancyText.length}</span>
          </div>

          {inputError ? <p className="mt-2 text-xs font-medium text-rose-500">{inputError}</p> : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="applicant-name" className="block text-sm font-semibold text-foreground">
                {copy.input.nameLabel}
              </label>
              <input
                id="applicant-name"
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder={copy.input.namePlaceholder}
                className="contact-field mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="applicant-city" className="block text-sm font-semibold text-foreground">
                {copy.input.cityLabel}
              </label>
              <input
                id="applicant-city"
                type="text"
                value={applicantCity}
                onChange={(e) => setApplicantCity(e.target.value)}
                placeholder={copy.input.cityPlaceholder}
                className="contact-field mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="applicant-profile" className="block text-sm font-semibold text-foreground">
              {copy.input.profileLabel}
            </label>
            <textarea
              id="applicant-profile"
              value={applicantProfile}
              onChange={(e) => setApplicantProfile(e.target.value)}
              placeholder={copy.input.profilePlaceholder}
              rows={3}
              maxLength={1500}
              className="contact-field mt-1.5 w-full resize-y rounded-xl px-3 py-2.5 text-sm"
            />
            <p className="mt-1 text-xs text-muted">{copy.input.profileHint}</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col text-sm font-semibold text-foreground">
              <span className="pb-1.5">{copy.input.letterLanguageLabel}</span>
              <select
                value={letterLanguage}
                onChange={(event) => setLetterLanguage(event.target.value as "de" | "en")}
                className="contact-field mt-auto w-full rounded-2xl px-3 py-2.5 text-sm font-normal"
              >
                {copy.input.letterLanguageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm font-semibold text-foreground">
              <span className="pb-1.5">{copy.input.lengthLabel}</span>
              <select
                value={letterLength}
                onChange={(event) => setLetterLength(event.target.value as LengthKey)}
                className="contact-field mt-auto w-full rounded-2xl px-3 py-2.5 text-sm font-normal"
              >
                {copy.input.lengthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm font-semibold text-foreground">
              <span className="pb-1.5">{copy.input.contactLabel}</span>
              <input
                type="text"
                value={contactPerson}
                onChange={(event) => setContactPerson(event.target.value)}
                placeholder={copy.input.contactPlaceholder}
                className="contact-field mt-auto w-full rounded-xl px-3 py-2.5 text-sm font-normal"
              />
            </label>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold tracking-[0.13em] text-primary uppercase">
              {copy.input.presetsLabel}
            </p>
            <div className="mt-2 grid gap-2">
              {copy.presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="ki-option-card rounded-2xl border border-border bg-background/80 p-3 text-left"
                >
                  <p className="text-sm font-semibold text-foreground">{preset.label}</p>
                  <p className="mt-1 break-words text-xs leading-relaxed text-muted">
                    {preset.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-foreground">
              {copy.input.focusLabel}
              <select
                value={focus}
                onChange={(event) => setFocus(event.target.value as FocusKey)}
                className="contact-field mt-2 w-full rounded-2xl px-3 py-2.5 text-sm"
              >
                {copy.focusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-foreground">
              {copy.input.toneLabel}
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value as ToneKey)}
                className="contact-field mt-2 w-full rounded-2xl px-3 py-2.5 text-sm"
              >
                {copy.toneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-foreground">
              {copy.input.modelLabel}
              <select
                value={models.length > 0 ? selectedModel : modelsLoading ? "loading" : "demo"}
                onChange={(event) => setSelectedModel(event.target.value)}
                disabled={models.length === 0}
                className="contact-field mt-2 w-full rounded-2xl px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {models.length > 0 ? (
                  models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))
                ) : (
                  <option value={modelsLoading ? "loading" : "demo"}>
                    {modelsLoading ? copy.input.modelLoading : copy.input.modelUnavailable}
                  </option>
                )}
              </select>
            </label>
            <p className="mt-1.5 text-xs text-muted">{copy.input.modelHint}</p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-foreground">{copy.input.strengthsLabel}</p>
            <p className="mt-1 text-xs text-muted">{copy.input.strengthsHint}</p>

            <ul className="mt-2 flex flex-wrap gap-2">
              {copy.strengths.map((strength) => {
                const isActive = selectedStrengths.includes(strength.id);
                return (
                  <li key={strength.id}>
                    <button
                      type="button"
                      onClick={() => toggleStrength(strength.id)}
                      aria-pressed={isActive}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? "border-primary/45 bg-primary/12 text-primary"
                          : "border-border bg-background/85 text-muted hover:-translate-y-0.5 hover:border-primary/40"
                      }`}
                    >
                      {strength.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="contact-submit mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary-solid px-4 py-3 text-sm font-semibold text-white"
          >
            {isGenerating ? copy.input.generating : copy.input.generate}
          </button>
        </section>

        <section className="space-y-4">
          <article className="rounded-3xl border border-border bg-card p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">{copy.output.title}</h2>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                {copyState === "copied"
                  ? copy.output.copied
                  : copyState === "error"
                    ? copy.output.copyError
                    : copy.output.copy}
              </button>
            </div>

            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full border border-border bg-background/85">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-200"
                  style={{ width: `${Math.max(6, progress * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>{statusText}</span>
                {generatedAtValue ? (
                  <span className="font-mono">
                    {copy.output.generatedAt} {generatedAtValue}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-4 min-h-[240px] rounded-2xl border border-border bg-background/65 p-3.5 sm:min-h-[360px] sm:p-4">
              {!streamedText && !isGenerating ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/70 p-4">
                  <p className="text-sm font-semibold text-foreground">{copy.output.emptyTitle}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{copy.output.emptyText}</p>
                </div>
              ) : (
                <pre
                  aria-live="polite"
                  className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground"
                >
                  {streamedText}
                  {isGenerating ? <span className="ki-stream-caret" aria-hidden>▍</span> : null}
                </pre>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-border bg-card p-4 sm:p-6">
            <h3 className="text-base font-semibold tracking-tight">{copy.analysis.title}</h3>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/70 p-3">
                <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                  {copy.analysis.company}
                </dt>
                <dd className="mt-1.5 break-words text-sm font-semibold text-foreground">
                  {analysis.company}
                </dd>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-3">
                <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                  {copy.analysis.role}
                </dt>
                <dd className="mt-1.5 break-words text-sm font-semibold text-foreground">
                  {analysis.role}
                </dd>
              </div>
            </dl>

            <div className="mt-3 rounded-2xl border border-border bg-background/70 p-3">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                {copy.analysis.keywords}
              </p>

              <ul className="mt-2 flex flex-wrap gap-2">
                {analysis.keywords.length > 0 ? (
                  analysis.keywords.map((keyword) => (
                    <li key={keyword}>
                      <span className="inline-flex rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted">
                        {keyword}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted">{copy.analysis.noKeywords}</li>
                )}
              </ul>
            </div>

            <div className="mt-3 rounded-2xl border border-primary/25 bg-primary/10 p-3">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                {copy.analysis.argument}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-foreground">{analysis.argumentLabel}</p>
              <p className="mt-1 text-xs text-muted">
                {copy.focusOptions.find((option) => option.value === focus)?.hint}
              </p>
            </div>
          </article>
        </section>
      </div>

      <div className="mt-5 space-y-1.5">
        <p className="text-xs leading-relaxed text-muted">
          {engineMode === "live"
            ? copy.footerNoteLive
            : modelsLoading
              ? copy.input.modelLoading
            : engineMode === "demo" || (!modelsLoading && models.length === 0)
              ? copy.footerNote
              : copy.footerNoteAvailable}
        </p>
        <p className="text-xs font-semibold text-primary">
          {engineMode === "live"
            ? copy.aiModeNoteLive
            : modelsLoading
              ? copy.input.modelLoading
            : engineMode === "demo" || (!modelsLoading && models.length === 0)
              ? copy.aiModeNote
              : copy.aiModeNoteAvailable}
        </p>
      </div>
    </main>
  );
}
