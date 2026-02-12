"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

type LocaleKey = "de" | "en";
type FocusKey = "frontend" | "fullstack" | "teamfit" | "ai";
type ToneKey = "professional" | "motivated" | "direct";

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
    presetsLabel: string;
    focusLabel: string;
    toneLabel: string;
    strengthsLabel: string;
    strengthsHint: string;
    generate: string;
    generating: string;
    errorRequired: string;
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
  aiModeNote: string;
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

type VacancyAnalysis = {
  company: string;
  role: string;
  keywords: string[];
  argumentLabel: string;
};

const COPY: Record<LocaleKey, DemoCopy> = {
  de: {
    badge: "Live-Demo · Mock AI ohne API-Key",
    title: "KI-Bewerbungshelfer",
    subtitle:
      "Stellenanzeige einfügen, Fokus setzen, Anschreiben generieren. Die Ausgabe wird wie bei einem echten LLM als Streaming-Text aufgebaut — inklusive strukturierter Formulierung für den deutschen Bewerbungsmarkt.",
    back: "Zurück zur Startseite",
    chips: ["Streaming Output", "HR-taugliche Formulierungen", "100% Mock-Daten lokal"],
    input: {
      title: "Stellenanzeige einfügen",
      hint: "Verwenden Sie den Originaltext der Ausschreibung. Der Helfer extrahiert Rolle, Keywords und passende Argumentation.",
      placeholder:
        "Beispiel: Wir suchen zum 01.08.2026 eine/n Auszubildende/n Fachinformatiker/in für Anwendungsentwicklung (m/w/d) in Berlin ...",
      characters: "Zeichen",
      presetsLabel: "Schnellstart-Vorlagen",
      focusLabel: "Fokus im Anschreiben",
      toneLabel: "Ton",
      strengthsLabel: "Persönliche Stärken hervorheben",
      strengthsHint: "Maximal 3 auswählen",
      nameLabel: "Ihr Name",
      namePlaceholder: "z.B. Max Mustermann",
      cityLabel: "Ihr Standort",
      cityPlaceholder: "z.B. München",
      generate: "Anschreiben generieren",
      generating: "Generiere Anschreiben ...",
      errorRequired: "Bitte zuerst eine Stellenanzeige einfügen.",
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
      "Hinweis: Dies ist eine Demo mit lokal simulierten AI-Antworten (kein externes Modell, kein API-Key nötig).",
    aiModeNote: "AI-Modus: Lokaler Demo-Generator (kein externes LLM)",
    presets: [
      {
        id: "preset-startup-frontend",
        label: "Startup Frontend (Berlin)",
        focus: "frontend",
        text:
          "Ein Berliner SaaS-Startup sucht zum 01.08.2026 eine/n Auszubildende/n Fachinformatiker/in für Anwendungsentwicklung (m/w/d). Du entwickelst im Frontend-Team Features mit React, Next.js und TypeScript, arbeitest eng mit Product/Design zusammen und verbesserst UX sowie Ladezeiten.",
      },
      {
        id: "preset-corporate-it",
        label: "Corporate IT (Inhouse)",
        focus: "teamfit",
        text:
          "Für unsere zentrale IT in München suchen wir Auszubildende Fachinformatiker Anwendungsentwicklung (w/m/d). Du arbeitest an internen Tools, APIs und Automatisierung. Wichtig sind Dokumentation, Abstimmung mit Fachabteilungen und eine verlässliche Zusammenarbeit im Team.",
      },
      {
        id: "preset-ecommerce",
        label: "E-Commerce Plattform",
        focus: "fullstack",
        text:
          "Ein wachsender E-Commerce-Anbieter in Hamburg stellt Auszubildende (m/w/d) ein. Aufgaben: Weiterentwicklung von Shop-Frontend, Checkout-Prozessen und Schnittstellen zu Zahlungs- und Warenwirtschaftssystemen. Erwartet werden JavaScript/TypeScript-Basis, API-Verständnis und datengetriebenes Denken.",
      },
      {
        id: "preset-public-sector",
        label: "Behörden / Öffentlicher Dienst",
        focus: "teamfit",
        text:
          "Eine kommunale IT-Dienststelle sucht Auszubildende Fachinformatiker/in Anwendungsentwicklung (m/w/d) für Digitalisierungsprojekte. Sie unterstützen Bürgerportale, Formular-Workflows und barrierearme Oberflächen. Gefragt sind Sorgfalt, Datenschutzbewusstsein und klare Kommunikation.",
      },
      {
        id: "preset-agency",
        label: "Digitalagentur Webprojekte",
        focus: "frontend",
        text:
          "Eine Agentur in Köln bietet eine Ausbildung im Bereich Anwendungsentwicklung an. Sie arbeiten in wechselnden Kundenprojekten an Landingpages, Content-Plattformen und UI-Komponenten. Gewünscht: saubere HTML/CSS/JS-Grundlagen, Kreativität und strukturierte Projektarbeit.",
      },
      {
        id: "preset-qa-testing",
        label: "QA / Testing Fokus",
        focus: "ai",
        text:
          "Ein Softwarehaus in Frankfurt sucht Auszubildende (m/w/d) mit Schwerpunkt Qualitätssicherung in der Entwicklung. Aufgaben sind Testfall-Design, automatisierte UI/API-Tests, Fehleranalyse und Zusammenarbeit mit Dev-Teams. Vorteilhaft: Interesse an Testing-Tools, CI und genauer Dokumentation.",
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
        label: "Full-Stack Orientierung",
        hint: "API-Denken, Datenfluss, saubere Schnittstellen",
      },
      {
        value: "teamfit",
        label: "Teamfit & Ausbildung",
        hint: "Lernkurve, Zuverlässigkeit, Zusammenarbeit",
      },
      {
        value: "ai",
        label: "AI-Produktivität",
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
        "Besonders stark bin ich in der Umsetzung responsiver Frontend-Lösungen mit Next.js und TypeScript. Ich achte konsequent auf Accessibility, Performance und eine klare Informationsarchitektur.",
      fullstack:
        "Neben der UI-Umsetzung denke ich Schnittstellen und Datenfluss mit. In Projekten habe ich API-Integrationen, Validierung und wartbare Strukturierung von Frontend- und Backend-Logik kombiniert.",
      teamfit:
        "Ich suche bewusst ein Ausbildungsteam, bei dem ich strukturiert Verantwortung übernehme, Feedback schnell in bessere Lösungen übersetze und mich fachlich wie menschlich weiterentwickle.",
      ai:
        "Ich nutze KI-Tools produktiv und verantwortungsvoll: für Recherche, Strukturierung und schnellere Iteration — immer mit klarer Qualitätskontrolle im finalen Code.",
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
        "Eigeninitiative zeige ich durch konsequentes Selbststudium und die eigenständige Umsetzung kompletter Projektmodule.",
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
    badge: "Live demo · Mock AI without API key",
    title: "AI Application Assistant",
    subtitle:
      "Paste a job description, set your focus and generate a cover letter. The output streams like a real LLM response with structured wording tailored to application workflows.",
    back: "Back to homepage",
    chips: ["Streaming output", "HR-ready wording", "100% local mock data"],
    input: {
      title: "Paste job description",
      hint: "Use the original vacancy text. The assistant extracts role, keywords and argument strategy.",
      placeholder:
        "Example: We are hiring an apprentice software developer (m/f/d) starting August 2026 in Berlin ...",
      characters: "characters",
      presetsLabel: "Quick presets",
      focusLabel: "Cover letter focus",
      toneLabel: "Tone",
      strengthsLabel: "Highlight strengths",
      strengthsHint: "Select up to 3",
      nameLabel: "Your name",
      namePlaceholder: "e.g. John Smith",
      cityLabel: "Your location",
      cityPlaceholder: "e.g. Munich",
      generate: "Generate cover letter",
      generating: "Generating cover letter ...",
      errorRequired: "Please paste a job description first.",
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
    footerNote: "Note: this is a local mock AI demo (no external model and no API key required).",
    aiModeNote: "AI mode: Local demo generator (no external LLM)",
    presets: [
      {
        id: "preset-startup-frontend",
        label: "Startup frontend (Berlin)",
        focus: "frontend",
        text:
          "A Berlin SaaS startup is hiring an apprentice software developer (m/f/d) starting August 2026. You will build product-facing frontend features with React, Next.js and TypeScript, collaborate closely with product/design and improve UX and page performance.",
      },
      {
        id: "preset-corporate-it",
        label: "Corporate IT (in-house)",
        focus: "teamfit",
        text:
          "Our central IT department in Munich is hiring apprentice developers. You work on internal tools, APIs and workflow automation. We expect clear documentation, cross-team collaboration and reliable delivery in a structured environment.",
      },
      {
        id: "preset-ecommerce",
        label: "E-commerce platform",
        focus: "fullstack",
        text:
          "A fast-growing e-commerce company in Hamburg is looking for apprentices (m/f/d). Tasks include improving storefront features, checkout flows and integrations with payment/inventory systems. We value JavaScript/TypeScript basics, API understanding and data-aware thinking.",
      },
      {
        id: "preset-public-sector",
        label: "Public sector / government IT",
        focus: "teamfit",
        text:
          "A municipal IT service provider offers an apprenticeship in software development. You support citizen portals, digital form workflows and accessibility-focused interfaces. We are looking for diligence, privacy awareness and clear communication.",
      },
      {
        id: "preset-agency",
        label: "Digital agency client work",
        focus: "frontend",
        text:
          "A digital agency in Cologne is hiring apprentices for web application development. You contribute to multiple client projects: landing pages, content platforms and reusable UI components. Solid HTML/CSS/JS basics, creativity and structured teamwork are required.",
      },
      {
        id: "preset-qa-testing",
        label: "QA / testing-focused role",
        focus: "ai",
        text:
          "A software company in Frankfurt is hiring apprentices with a QA/testing focus. Responsibilities include test case design, automated UI/API testing, bug triage and collaboration with developers. Interest in testing tools, CI pipelines and precise documentation is a plus.",
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
        label: "Team fit & Ausbildung",
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
        "I am strongest when building responsive frontend solutions with Next.js and TypeScript, with clear attention to accessibility, performance and hierarchy.",
      fullstack:
        "Beyond UI delivery, I think in APIs and data flow. In projects, I combine integration work, validation and maintainable frontend/backend structures.",
      teamfit:
        "I am intentionally looking for an Ausbildung team where I can take ownership early, turn feedback into better solutions quickly and grow in a structured environment.",
      ai:
        "I use AI tools productively and responsibly for research, structuring and faster iteration, always with strict quality checks before final delivery.",
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
        "I show initiative through disciplined self-learning and independent delivery of complete project modules.",
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

function normalizeCompany(rawValue: string) {
  return rawValue
    .replace(/[|,;:\n]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[.!?]$/, "")
    .trim();
}

function extractCompany(vacancyText: string) {
  const patterns = [
    /(?:bei|für)\s+([A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9&.\- ]{2,42})/i,
    /(?:unternehmen|arbeitgeber)\s*[:\-]\s*([A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9&.\- ]{2,42})/i,
    /([A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9&.\- ]{2,42})\s+(?:sucht|stellt ein|sucht zum)/i,
  ];

  for (const pattern of patterns) {
    const match = vacancyText.match(pattern);
    if (!match?.[1]) {
      continue;
    }

    const normalized = normalizeCompany(match[1]);
    if (normalized.length > 1) {
      return normalized;
    }
  }

  return "";
}

function extractRole(vacancyText: string, fallbackRole: string) {
  const text = vacancyText.toLowerCase();

  if (text.includes("fachinformatiker") && text.includes("anwendungsentwicklung")) {
    return "Fachinformatiker/in für Anwendungsentwicklung (m/w/d)";
  }

  if (text.includes("frontend")) {
    return "Frontend Developer / Frontend-Ausbildung (m/w/d)";
  }

  if (text.includes("fullstack") || text.includes("full-stack")) {
    return "Full-Stack Developer (m/w/d)";
  }

  if (text.includes("ausbildung") && text.includes("software")) {
    return "Ausbildung im Bereich Softwareentwicklung (m/w/d)";
  }

  if (text.includes("softwareentwickler") || text.includes("software developer")) {
    return "Software Developer (m/w/d)";
  }

  return fallbackRole;
}

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
}) {
  const { analysis, tone, focus, strengths, copy, applicantName, applicantCity } = params;
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
    "Anlagen: Lebenslauf, Zeugnisse",
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
}) {
  const { analysis, tone, focus, strengths, copy, applicantName, applicantCity } = params;
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
  const role = extractRole(vacancyText, copy.analysis.fallbackRole);
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
  const [applicantName, setApplicantName] = useState("Oleksandr");
  const [applicantCity, setApplicantCity] = useState("");
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

  const streamTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current !== null) {
        window.clearTimeout(streamTimerRef.current);
      }
    };
  }, []);

  const analysis = useMemo(
    () => createAnalysis(copy, vacancyText, focus, localeKey),
    [copy, focus, vacancyText],
  );

  const progress = targetText.length > 0 ? streamedText.length / targetText.length : 0;
  const statusText = useMemo(() => {
    if (!targetText) {
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
  }, [copy.output, isGenerating, progress, targetText]);

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

  const handleGenerate = () => {
    const trimmed = vacancyText.trim();
    if (!trimmed) {
      setInputError(copy.input.errorRequired);
      return;
    }

    setInputError("");
    setCopyState("idle");

    const nextAnalysis = createAnalysis(copy, trimmed, focus, localeKey);
    const generated =
      localeKey === "de"
        ? buildGermanLetter({
            analysis: nextAnalysis,
            tone,
            focus,
            strengths: selectedStrengths,
            copy,
            applicantName: applicantName.trim() || "Oleksandr",
            applicantCity: applicantCity.trim(),
          })
        : buildEnglishLetter({
            analysis: nextAnalysis,
            tone,
            focus,
            strengths: selectedStrengths,
            copy,
            applicantName: applicantName.trim() || "Oleksandr",
            applicantCity: applicantCity.trim(),
          });

    streamText(generated);
  };

  const handleCopy = async () => {
    const textToCopy = targetText || streamedText;
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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {copy.badge}
          </span>
          <Link
            href="/#projects"
            className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            ← {copy.back}
          </Link>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-4xl leading-relaxed text-muted">{copy.subtitle}</p>

        <ul className="mt-5 flex flex-wrap gap-2.5">
          {copy.chips.map((chip) => (
            <li key={chip} className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-muted">
              {chip}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
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
                    {preset.text.slice(0, 120)}...
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
            className="contact-submit mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary-solid px-4 py-2.5 text-sm font-semibold text-white"
          >
            {isGenerating ? copy.input.generating : copy.input.generate}
          </button>
        </section>

        <section className="space-y-4">
          <article className="rounded-3xl border border-border bg-card p-5 sm:p-6">
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

            <div className="mt-4 min-h-[300px] rounded-2xl border border-border bg-background/65 p-4 sm:min-h-[360px]">
              {!targetText ? (
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

          <article className="rounded-3xl border border-border bg-card p-5 sm:p-6">
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
        <p className="text-xs leading-relaxed text-muted">{copy.footerNote}</p>
        <p className="text-xs font-semibold text-primary">{copy.aiModeNote}</p>
      </div>
    </main>
  );
}
