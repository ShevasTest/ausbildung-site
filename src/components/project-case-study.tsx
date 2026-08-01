type LocaleKey = "de" | "en";

type CaseStudy = {
  eyebrow: string;
  title: string;
  intro: string;
  role: string;
  decisions: string[];
  proof: string[];
  learning: string;
};

type ProjectCaseStudyProps = {
  locale: string;
  slug:
    | "mono-api-agent"
    | "e2e-suite"
    | "ki-bewerbungshelfer"
    | "mietpreise-tracker"
    | "smartchat"
    | "devdash";
};

const CODE_URLS: Record<ProjectCaseStudyProps["slug"], string> = {
  "mono-api-agent": "https://github.com/ShevasTest/mono-api-agent",
  "e2e-suite": "https://github.com/ShevasTest/portfolio-e2e-tests",
  "ki-bewerbungshelfer": "https://github.com/ShevasTest/portfolio-website",
  "mietpreise-tracker": "https://github.com/ShevasTest/portfolio-website",
  smartchat: "https://github.com/ShevasTest/portfolio-website",
  devdash: "https://github.com/ShevasTest/portfolio-website",
};

const COPY = {
  de: {
    role: "Meine Rolle",
    decisions: "Wichtige Entscheidungen",
    proof: "Was technisch funktioniert",
    learning: "Nächster Entwicklungsschritt",
    code: "Quellcode ansehen",
  },
  en: {
    role: "My role",
    decisions: "Key decisions",
    proof: "What works technically",
    learning: "Next development step",
    code: "View source code",
  },
} satisfies Record<LocaleKey, Record<string, string>>;

const CASE_STUDIES: Record<LocaleKey, Record<ProjectCaseStudyProps["slug"], CaseStudy>> = {
  de: {
    "mono-api-agent": {
      eyebrow: "Case Study · RAG & Retrieval",
      title: "Ein RAG-Agent über eine offizielle OpenAPI-Spezifikation — an einem Tag",
      intro:
        "Der Agent beantwortet Fragen zur öffentlichen monobank-API ausschließlich aus deren offizieller OpenAPI-Spezifikation: 25 Endpunkte und 45 Schemata, zerlegt in rund 70 Chunks. Entstanden an einem Tag — und an diesem Tag zweimal umgebaut, weil die Messwerte es verlangten.",
      role: "Architektur, Retrieval-Strategie und alle Messungen stammen von mir; die Implementierung ist KI-gestützt — die Entscheidungen, warum etwas so und nicht anders gebaut ist, kann ich einzeln begründen.",
      decisions: [
        "Chunking pro API-Methode statt nach Zeichenzahl: In einer API-Dokumentation ist eine Methode die natürliche Grenze — eine größenbasierte Aufteilung reißt Beschreibung und Felder auseinander.",
        "Das Embedding wird nicht über den gesamten Chunk berechnet: Bei zwei Zeilen Beschreibung und vierzig Zeilen ausgerolltem Schema beschrieb der Vektor Feldnamen statt des Zwecks der Methode — invoice/create landete nicht in den Top-3.",
        "Ein lexikalisches Signal liegt über der Vektorsuche: Die Scores drängten sich bei 0,82–0,87 zusammen; eine exakte Wortübereinstimmung ist ein starkes Signal, das der Vektor unterbewertet.",
        "Die Selbstprüfung ist deterministisch statt LLM-Judge: Der Judge lieferte Fehlalarme und erzwang eine zusätzliche Runde.",
      ],
      proof: [
        "Antwortzeit 60 s → 2,8 s, Modellaufrufe pro Frage 5 → 2",
        "Deterministische Prüfung fängt erfundene Endpunkt-Pfade ab",
        "Fällt kein Modell an, gibt der Agent die gefundenen Spezifikationsfragmente mit Warnung zurück",
      ],
      learning:
        "Ehrliche Grenze: Die Prüfung fängt erfundene Pfade, aber noch keine erfundenen Feldnamen — genau das ist der nächste Schritt.",
    },
    "e2e-suite": {
      eyebrow: "Case Study · Testautomatisierung",
      title: "Eine öffentliche E2E-Suite als überprüfbarer Qualitätsnachweis",
      intro:
        "Die Suite testet genau diese Website in GitHub Actions — bei jedem Push und wöchentlich gegen Produktion: UI-Flows, API-Contracts, SEO-Infrastruktur und Accessibility, auf Desktop- und Mobile-Profilen.",
      role: "Anforderungen, Teststrategie und Abdeckung stammen von mir; die Implementierung ist KI-gestützt — Verifikation, Debugging und der CI-Betrieb liegen in meiner Hand.",
      decisions: [
        "Deterministisch per Konstruktion: keine LLM-Antworten in Assertions; API-Tests prüfen den Contract statt volatiler Payloads.",
        "Page Object Model und Fixtures halten die Specs deklarativ und wartbar.",
        "Accessibility als Gate: ernste axe-Verstöße lassen den Build fehlschlagen.",
      ],
      proof: [
        "56 Checks auf Desktop Chrome und Pixel 7 (Mobile)",
        "CI bei jedem Push plus wöchentlicher Lauf gegen Produktion",
        "Traces und Screenshots bei Fehlschlägen als Build-Artefakte",
      ],
      learning:
        "Der Positioning-Contract gegen veraltete Inhalte ist inzwischen Teil der Suite. Als Nächstes: tiefere deterministische Workflow-Szenarien für die Produkt-Demos.",
    },
    "ki-bewerbungshelfer": {
      eyebrow: "Case Study · AI mit überprüfbarem Nutzen",
      title: "Von einer Stellenanzeige zu einem strukturierten Entwurf",
      intro:
        "Das Ziel war kein weiterer allgemeiner Chatbot, sondern ein eng geführter Workflow für Bewerber:innen: Ausschreibung verstehen, relevante Argumente auswählen und einen editierbaren Brief erzeugen.",
      role: "Produktidee, Informationsarchitektur, UI-Umsetzung, Prompt-Logik und Integration der Modell-APIs.",
      decisions: [
        "Fokus, Ton und Stärken werden explizit gewählt statt in einem freien Prompt versteckt.",
        "Groq und wechselnde kostenlose OpenRouter-Modelle werden dynamisch geladen.",
        "Bei Provider-Fehlern fällt die Anfrage kontrolliert auf das nächste Modell zurück.",
      ],
      proof: [
        "Streaming-Antwort über eine eigene Server-Route",
        "Eingabevalidierung, AbortController und Rate-Limits",
        "Fallback-Modus und klare Statuskommunikation",
      ],
      learning:
        "Als Nächstes würde ich Qualitätschecks für Fakten, Ton und Wiederholungen ergänzen und mehrere Entwürfe vergleichbar machen.",
    },
    "mietpreise-tracker": {
      eyebrow: "Case Study · Daten verständlich machen",
      title: "Mietniveau nicht nur anzeigen, sondern in eine Entscheidung übersetzen",
      intro:
        "Der Tracker verbindet Marktdaten mit einer konkreten Frage: Welche Stadt und Wohnungsgröße passen zu meinem Haushaltsbudget? Dadurch werden Diagramm, Ranking und Rechner Teil eines gemeinsamen Ablaufs.",
      role: "Datenmodell, UI-Konzept, Visualisierung, Berechnungslogik und responsive Umsetzung.",
      decisions: [
        "Eine Stadt steuert gleichzeitig Trend, Ranking und Einkommensrechnung.",
        "Angebotsmieten werden als kuratierter Datensatz gekennzeichnet, nicht als Echtzeitwert verkauft.",
        "Quellen und Berechnungsannahmen sind direkt im Produkt verlinkt.",
      ],
      proof: [
        "Interaktives SVG-Diagramm mit zugänglicher Beschriftung",
        "Zwei Haushalts- und Budgetmodelle",
        "Getestete, ausgelagerte Berechnungslogik",
      ],
      learning:
        "Der nächste Schritt wäre ein versionierter Importprozess, der neue Quartalsdaten prüft und Änderungen transparent dokumentiert.",
    },
    smartchat: {
      eyebrow: "Case Study · Streaming Interface",
      title: "Ein Chat als Frontend-System, nicht nur als Texteingabe",
      intro:
        "SmartChat untersucht die UI-Probleme eines modernen Chats: laufende Antworten, formatierter Inhalt, mehrere Threads, lokale Persistenz und unterschiedliche Antwortstile.",
      role: "Interaktionsdesign, State-Management, Markdown-Renderer, Streaming-Client und Modellintegration.",
      decisions: [
        "Jede Unterhaltung speichert Verlauf und Antwortstil lokal im Browser.",
        "Markdown und Codeblöcke werden ohne schwere UI-Bibliothek lesbar dargestellt.",
        "Modellstatus und Provider-Fallback bleiben für Nutzer:innen sichtbar.",
      ],
      proof: [
        "Live-Streaming mit Abbrechen-Funktion",
        "Dynamischer Modellkatalog von Groq und OpenRouter",
        "ARIA-Live-Region und klarer Keyboard-Workflow",
      ],
      learning:
        "Für eine produktive Version würde ich Suche, Export und serverseitig synchronisierte Threads ergänzen — inklusive Datenschutzkonzept.",
    },
    devdash: {
      eyebrow: "Case Study · API-Orchestrierung",
      title: "Mehrere Datenquellen in einem robusten Arbeitsbereich",
      intro:
        "DevDash demonstriert, wie unabhängige Widgets mit Live-Daten, lokalen Werkzeugen und eigenen Fehlerzuständen in einer konsistenten Oberfläche zusammenarbeiten.",
      role: "Dashboard-Architektur, API-Anbindung, Widget-State, PWA-Grundlagen und zugängliche Sortierung.",
      decisions: [
        "Jedes Widget besitzt einen klaren Lade-, Fehler- oder lokalen Zustand.",
        "Layout, Notizen und Fokus-Sessions bleiben ohne Benutzerkonto erhalten.",
        "Neben Drag-and-Drop gibt es sichtbare Buttons für Tastatur und Mobile.",
      ],
      proof: [
        "Open-Meteo, GitHub und Hacker News als Live-Quellen",
        "Persistentes Widget-Layout und Notizen",
        "Pomodoro, PWA-Checks und responsive Karten",
      ],
      learning:
        "Eine nächste Version würde die Widgets stärker auf einen einzigen Entwickler-Workflow reduzieren und die API-Beobachtbarkeit ausbauen.",
    },
  },
  en: {
    "mono-api-agent": {
      eyebrow: "Case study · RAG & retrieval",
      title: "A RAG agent over an official OpenAPI specification — in one day",
      intro:
        "The agent answers questions about monobank's public API strictly from their official OpenAPI specification: 25 endpoints and 45 schemas, split into roughly 70 chunks. Built in a single day — and rebuilt twice that day because the measurements demanded it.",
      role: "Architecture, retrieval strategy and every measurement are mine; the implementation is AI-assisted — I can justify each decision about why it is built this way and not another.",
      decisions: [
        "Chunking per API method instead of by character count: in API documentation a method is the natural boundary — size-based splitting tears the description away from its fields.",
        "The embedding is not computed over the whole chunk: with a two-line description and forty lines of expanded schema, the vector described field names instead of the method's purpose — invoice/create never reached the top 3.",
        "A lexical signal sits on top of vector search: scores clustered at 0.82–0.87, and an exact word match is a strong signal that the vector underweights.",
        "Self-checking is deterministic rather than an LLM judge: the judge produced false positives and forced an extra round trip.",
      ],
      proof: [
        "Response time 60 s → 2.8 s, model calls per question 5 → 2",
        "The deterministic check catches invented endpoint paths",
        "If no model responds, the agent returns the retrieved spec fragments with a warning",
      ],
      learning:
        "An honest limit: the check catches invented paths but not yet invented field names — that is exactly the next step.",
    },
    "e2e-suite": {
      eyebrow: "Case study · Test automation",
      title: "A public e2e suite as verifiable proof of quality",
      intro:
        "The suite tests this very website in GitHub Actions — on every push and weekly against production: UI flows, API contracts, SEO infrastructure and accessibility, on desktop and mobile profiles.",
      role: "Requirements, test strategy and coverage are mine; the implementation is AI-assisted — verification, debugging and CI operation stay in my hands.",
      decisions: [
        "Deterministic by construction: no LLM responses in assertions; API tests pin the contract, not volatile payloads.",
        "Page Object Model and fixtures keep the specs declarative and maintainable.",
        "Accessibility as a gate: serious axe violations fail the build.",
      ],
      proof: [
        "56 checks on Desktop Chrome and Pixel 7 (mobile)",
        "CI on every push plus a weekly run against production",
        "Traces and screenshots on failure as build artifacts",
      ],
      learning:
        "The positioning contract against outdated content is now part of the suite. Next up: deeper deterministic workflow scenarios for the product demos.",
    },
    "ki-bewerbungshelfer": {
      eyebrow: "Case study · Verifiable AI value",
      title: "From a vacancy to a structured application draft",
      intro:
        "The goal was not another general chatbot, but a guided workflow: understand the vacancy, select relevant arguments and generate an editable letter.",
      role: "Product concept, information architecture, UI implementation, prompt logic and model API integration.",
      decisions: [
        "Focus, tone and strengths are explicit controls instead of hidden prompt text.",
        "Groq and rotating free OpenRouter models load dynamically.",
        "Provider failures fall back to the next available model.",
      ],
      proof: ["Server-side streaming", "Input validation, abort handling and rate limits", "Visible live and fallback states"],
      learning: "Next I would add quality checks for facts, tone and repetition, plus side-by-side draft comparison.",
    },
    "mietpreise-tracker": {
      eyebrow: "Case study · Clear data products",
      title: "Turning rent data into a household decision",
      intro:
        "The tracker connects market data to a practical question: which city and apartment size fit a household budget?",
      role: "Data model, UI concept, visualization, calculation logic and responsive implementation.",
      decisions: [
        "One city selection updates trend, ranking and income estimate.",
        "The curated dataset is clearly distinguished from real-time data.",
        "Sources and assumptions are linked directly in the product.",
      ],
      proof: ["Accessible interactive SVG chart", "Two household and budget modes", "Extracted, tested calculation logic"],
      learning: "The next step is a versioned import pipeline that validates quarterly data and documents changes.",
    },
    smartchat: {
      eyebrow: "Case study · Streaming interface",
      title: "Treating chat as a frontend system, not a text box",
      intro:
        "SmartChat explores the UI problems behind modern chat: streaming, formatted content, multiple threads, local persistence and response styles.",
      role: "Interaction design, state management, Markdown rendering, streaming client and model integration.",
      decisions: [
        "Each thread stores its history and style locally.",
        "Markdown and code remain readable without a heavy UI framework.",
        "Model status and provider fallback stay visible.",
      ],
      proof: ["Cancellable live streaming", "Dynamic Groq/OpenRouter catalog", "ARIA live region and keyboard-first composer"],
      learning: "A production version would add search, export and privacy-aware server-side thread sync.",
    },
    devdash: {
      eyebrow: "Case study · API orchestration",
      title: "Combining multiple data sources in one resilient workspace",
      intro:
        "DevDash demonstrates how independent live-data and local-tool widgets can share a consistent interface and predictable states.",
      role: "Dashboard architecture, API integration, widget state, PWA foundations and accessible reordering.",
      decisions: [
        "Every widget has a loading, error or local state.",
        "Layout, notes and focus sessions persist without an account.",
        "Visible move buttons complement drag and drop on keyboard and mobile.",
      ],
      proof: ["Open-Meteo, GitHub and Hacker News APIs", "Persistent layout and notes", "Pomodoro, PWA checks and responsive cards"],
      learning: "The next version would reduce the dashboard to one developer workflow and add stronger API observability.",
    },
  },
};

export function ProjectCaseStudy({ locale, slug }: ProjectCaseStudyProps) {
  const localeKey: LocaleKey = locale === "de" ? "de" : "en";
  const copy = COPY[localeKey];
  const study = CASE_STUDIES[localeKey][slug];

  return (
    <aside className="render-deferred mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16" aria-labelledby={`${slug}-case-study`}>
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 lg:p-9">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">{study.eyebrow}</p>
        <h2 id={`${slug}-case-study`} className="font-display mt-3 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl">
          {study.title}
        </h2>
        <p className="mt-3 max-w-4xl leading-relaxed text-muted">{study.intro}</p>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <article className="rounded-2xl border border-border bg-background/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">{copy.role}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{study.role}</p>
          </article>
          <article className="rounded-2xl border border-border bg-background/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">{copy.decisions}</h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
              {study.decisions.map((decision) => <li key={decision}>— {decision}</li>)}
            </ul>
          </article>
          <article className="rounded-2xl border border-border bg-background/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">{copy.proof}</h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
              {study.proof.map((item) => <li key={item}>— {item}</li>)}
            </ul>
          </article>
        </div>

        <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/8 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">{copy.learning}</p>
            <p className="mt-1 max-w-4xl text-sm leading-relaxed text-muted">{study.learning}</p>
          </div>
          <a
            href={CODE_URLS[slug]}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            {copy.code} ↗
          </a>
        </div>
      </div>
    </aside>
  );
}
