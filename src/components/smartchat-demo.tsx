"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { decodeLlmLabel } from "@/lib/llm-label";

type LocaleKey = "de" | "en";
type StyleKey = "direkt" | "strukturiert" | "kompakt";
type ChatRole = "user" | "assistant";
type EngineMode = "unknown" | "live" | "demo";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  isStreaming?: boolean;
};

type ChatThread = {
  id: string;
  title: string;
  style: StyleKey;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

type StyleOption = {
  id: StyleKey;
  label: string;
  badge: string;
  description: string;
  voice: string;
};

type DemoCopy = {
  badge: string;
  title: string;
  subtitle: string;
  back: string;
  chips: string[];
  sidebar: {
    historyTitle: string;
    historyHint: string;
    newChat: string;
    styleTitle: string;
    styleHint: string;
    modelTitle: string;
    modelHint: string;
    untitled: string;
  };
  chat: {
    assistantLabel: string;
    userLabel: string;
    welcomeMessage: string;
    typing: string;
    emptyTitle: string;
    emptyText: string;
    generatedAt: string;
  };
  status: {
    live: string;
    demo: string;
    rateLimited: string;
  };
  composer: {
    placeholder: string;
    send: string;
    sending: string;
    stop: string;
    hint: string;
  };
  quickPromptsTitle: string;
  quickPrompts: string[];
  footerNoteLive: string;
  footerNoteDemo: string;
  styles: StyleOption[];
};

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; language: string; code: string };

type SmartChatDemoProps = {
  locale: string;
};

const COPY: Record<LocaleKey, DemoCopy> = {
  de: {
    badge: "Live-Demo · SmartChat",
    title: "SmartChat",
    subtitle:
      "ChatGPT-ähnliche Oberfläche mit Chat-Verlauf, Antwortstilen, Streaming-Antworten, Markdown-Rendering und Code-Highlighting. Die Antworten kommen von einem echten Sprachmodell über eine eigene Server-Route — ohne konfigurierten API-Key läuft automatisch ein lokaler Demo-Modus.",
    back: "Zurück zur Startseite",
    chips: ["Live-Streaming", "Markdown + Code", "Verlauf lokal gespeichert", "Antwortstile"],
    sidebar: {
      historyTitle: "Chat-Verlauf",
      historyHint: "Unterhaltungen werden lokal im Browser gespeichert und bleiben beim nächsten Besuch erhalten.",
      newChat: "Neue Unterhaltung",
      styleTitle: "Antwortstil",
      styleHint: "Jeder Thread kann mit einem eigenen Antwortstil laufen.",
      modelTitle: "KI-Modell",
      modelHint: "Kostenlose Modelle — die Liste passt sich automatisch an die verfügbaren Modelle an.",
      untitled: "Neue Unterhaltung",
    },
    chat: {
      assistantLabel: "SmartChat",
      userLabel: "Sie",
      welcomeMessage:
        "Hallo! Ich bin **SmartChat** — der KI-Assistent in diesem Portfolio.\n\n- Fragen Sie in Ihrer bevorzugten Sprache nach Oleksandr, den Projekten, Entwicklung, Bewerbung oder allgemeinen Themen.\n- Ich antworte mit **Streaming-Ausgabe** und `Markdown` inklusive Codeblöcken.\n- Ihr Verlauf bleibt lokal in Ihrem Browser.\n\nHinweis: Ich habe keinen Live-Zugriff auf Websuche, Wetter, Nachrichten oder Kurse und kennzeichne solche Grenzen offen.",
      typing: "Antwort wird gestreamt ...",
      emptyTitle: "Noch keine Nachrichten",
      emptyText: "Starten Sie links eine neue Unterhaltung und schicken Sie rechts Ihre erste Nachricht.",
      generatedAt: "um",
    },
    status: {
      live: "Live-KI",
      demo: "Demo-Modus",
      rateLimited:
        "**Kurze Pause:** Das Anfragelimit ist gerade erreicht. Bitte versuchen Sie es in einer Minute erneut.",
    },
    composer: {
      placeholder:
        "Fragen Sie etwas — gern auch in einer anderen Sprache ...",
      send: "Senden",
      sending: "Streaming ...",
      stop: "Stoppen",
      hint: "Enter = senden · Shift + Enter = neue Zeile",
    },
    quickPromptsTitle: "Schnellstarts",
    quickPrompts: [
      "Was ist Oleksandrs stärkste technische Kompetenz?",
      "Wie erkläre ich Eigeninitiative im Vorstellungsgespräch auf Deutsch?",
      "Wie funktioniert das Streaming technisch in diesem Chat?",
      "Welche 3 UX-Details machen einen Chat wie ChatGPT professionell?",
    ],
    footerNoteLive:
      "Hinweis: Antworten werden von einem echten Sprachmodell über eine Server-Route mit Rate-Limit generiert. Bitte keine persönlichen oder vertraulichen Daten eingeben.",
    footerNoteDemo:
      "Hinweis: Aktuell läuft der lokale Demo-Modus (kein API-Key auf dem Server konfiguriert). Die Oberfläche, das Streaming und der Verlauf funktionieren identisch — mit API-Key antwortet ein echtes Sprachmodell.",
    styles: [
      {
        id: "direkt",
        label: "Direkt",
        badge: "Schnell",
        description: "Kurze, umsetzungsorientierte Antworten mit klaren nächsten Schritten.",
        voice: "Ich gehe direkt auf die Kernfrage ein und liefere sofort umsetzbare Bausteine.",
      },
      {
        id: "strukturiert",
        label: "Strukturiert",
        badge: "Gegliedert",
        description: "Klare Gliederung mit kurzen Überschriften und knapper Begründung.",
        voice: "Ich strukturiere die Antwort stärker und begründe kurz die technischen Trade-offs.",
      },
      {
        id: "kompakt",
        label: "Kompakt",
        badge: "Auf den Punkt",
        description: "Nur das Wesentliche — ideal für schnelle Checks.",
        voice: "Ich priorisiere die kompakteste brauchbare Antwort.",
      },
    ],
  },
  en: {
    badge: "Live demo · SmartChat",
    title: "SmartChat",
    subtitle:
      "ChatGPT-like interface with chat history, answer styles, streaming replies, markdown rendering and code highlighting. Replies come from a real language model through a dedicated server route — without a configured API key the demo automatically falls back to a local mode.",
    back: "Back to homepage",
    chips: ["Live streaming", "Markdown + code", "History stored locally", "Answer styles"],
    sidebar: {
      historyTitle: "Chat history",
      historyHint: "Conversations are stored locally in your browser and survive your next visit.",
      newChat: "New conversation",
      styleTitle: "Answer style",
      styleHint: "Each thread can run with its own answer style.",
      modelTitle: "AI model",
      modelHint: "Free models — the list adapts automatically to what is currently available.",
      untitled: "New conversation",
    },
    chat: {
      assistantLabel: "SmartChat",
      userLabel: "You",
      welcomeMessage:
        "Hi! I am **SmartChat** — the AI assistant inside this portfolio.\n\n- Ask in your preferred language about Oleksandr, the projects, development, applications or general topics.\n- I answer with **streaming output** and `Markdown` including code blocks.\n- Your history stays local in your browser.\n\nNote: I have no live access to web search, weather, news or prices and will state those limits clearly.",
      typing: "Streaming response ...",
      emptyTitle: "No messages yet",
      emptyText: "Create a thread on the left and send your first message.",
      generatedAt: "at",
    },
    status: {
      live: "Live AI",
      demo: "Demo mode",
      rateLimited:
        "**Short break:** the request limit was just reached. Please try again in a minute.",
    },
    composer: {
      placeholder: "Ask anything — in your preferred language ...",
      send: "Send",
      sending: "Streaming ...",
      stop: "Stop",
      hint: "Enter = send · Shift + Enter = newline",
    },
    quickPromptsTitle: "Quick starters",
    quickPrompts: [
      "What is Oleksandr's strongest technical skill?",
      "How can I explain initiative in a German frontend interview?",
      "How exactly does streaming work in this chat?",
      "Which 3 UX details make a chat app feel professional?",
    ],
    footerNoteLive:
      "Note: replies are generated by a real language model through a rate-limited server route. Please do not enter personal or confidential data.",
    footerNoteDemo:
      "Note: the local demo mode is active (no API key configured on the server). UI, streaming and history behave identically — with an API key a real language model answers.",
    styles: [
      {
        id: "direkt",
        label: "Direct",
        badge: "Fast",
        description: "Short, implementation-oriented replies with clear next steps.",
        voice: "I keep it concise and highly actionable.",
      },
      {
        id: "strukturiert",
        label: "Structured",
        badge: "Organized",
        description: "Clear hierarchy with short headings and brief reasoning.",
        voice: "I prioritize structure and explicit reasoning.",
      },
      {
        id: "kompakt",
        label: "Compact",
        badge: "To the point",
        description: "Essentials only — ideal for quick checks.",
        voice: "I prioritize the most compact useful answer.",
      },
    ],
  },
};

const LANGUAGE_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  sh: "bash",
  zsh: "bash",
  shell: "bash",
};

const BASE_KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "switch",
  "case",
  "break",
  "for",
  "while",
  "type",
  "interface",
  "extends",
  "import",
  "export",
  "from",
  "async",
  "await",
  "try",
  "catch",
  "new",
  "class",
  "public",
  "private",
  "protected",
  "readonly",
  "null",
  "undefined",
  "true",
  "false",
]);

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function createThreadTitle(prompt: string, fallback: string) {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function createInitialThread(copy: DemoCopy): ChatThread {
  const timestamp = Date.now();
  return {
    id: createId("thread"),
    title: copy.sidebar.untitled,
    style: copy.styles[0]?.id ?? "direkt",
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [
      {
        id: createId("msg"),
        role: "assistant",
        content: copy.chat.welcomeMessage,
        createdAt: timestamp,
      },
    ],
  };
}

function normalizeLanguage(language: string) {
  const raw = language.trim().toLowerCase();
  if (!raw) {
    return "text";
  }

  return LANGUAGE_ALIASES[raw] ?? raw;
}

function parseTextBlocks(text: string): MarkdownBlock[] {
  const lines = text.split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index] ?? "";
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("#### ")) {
      blocks.push({ type: "heading", level: 4, text: trimmed.slice(5).trim() });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "heading", level: 3, text: trimmed.slice(4).trim() });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, text: trimmed.slice(3).trim() });
      index += 1;
      continue;
    }

    if (/^(?:-|\*)\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = (lines[index] ?? "").trim();
        if (!/^(?:-|\*)\s+/.test(candidate)) {
          break;
        }
        items.push(candidate.replace(/^(?:-|\*)\s+/, "").trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = (lines[index] ?? "").trim();
        if (!/^\d+\.\s+/.test(candidate)) {
          break;
        }
        items.push(candidate.replace(/^\d+\.\s+/, "").trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const candidate = (lines[index] ?? "").trim();
        if (!candidate.startsWith("> ")) {
          break;
        }
        quoteLines.push(candidate.slice(2).trim());
        index += 1;
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ") });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const candidate = (lines[index] ?? "").trim();
      if (
        !candidate ||
        candidate.startsWith("##") ||
        candidate.startsWith("###") ||
        candidate.startsWith("####") ||
        /^(?:-|\*)\s+/.test(candidate) ||
        /^\d+\.\s+/.test(candidate) ||
        candidate.startsWith("> ")
      ) {
        break;
      }

      paragraphLines.push(candidate);
      index += 1;
    }

    if (paragraphLines.length > 0) {
      blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
      continue;
    }

    index += 1;
  }

  return blocks;
}

function parseMarkdown(content: string): MarkdownBlock[] {
  const codePattern = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
  const blocks: MarkdownBlock[] = [];
  let cursor = 0;
  let match = codePattern.exec(content);

  while (match) {
    const start = match.index;
    const end = codePattern.lastIndex;

    if (start > cursor) {
      blocks.push(...parseTextBlocks(content.slice(cursor, start)));
    }

    const language = normalizeLanguage(match[1] ?? "text");
    const code = (match[2] ?? "").replace(/\n$/, "");
    blocks.push({ type: "code", language, code });

    cursor = end;
    match = codePattern.exec(content);
  }

  if (cursor < content.length) {
    blocks.push(...parseTextBlocks(content.slice(cursor)));
  }

  return blocks;
}

function renderInline(text: string) {
  const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const result: ReactNode[] = [];
  let cursor = 0;
  let match = tokenPattern.exec(text);

  while (match) {
    if (match.index > cursor) {
      result.push(text.slice(cursor, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      result.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      result.push(
        <code key={`code-${match.index}`} className="smartchat-inline-code">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      result.push(token);
    }

    cursor = match.index + token.length;
    match = tokenPattern.exec(text);
  }

  if (cursor < text.length) {
    result.push(text.slice(cursor));
  }

  return result;
}

function tokenClassName(token: string, language: string) {
  if (token.startsWith("//") || token.startsWith("#") || token.startsWith("/*")) {
    return "smartchat-token-comment";
  }

  if (/^['"`]/.test(token)) {
    return "smartchat-token-string";
  }

  if (/^\d+(?:\.\d+)?$/.test(token)) {
    return "smartchat-token-number";
  }

  const normalizedLanguage = normalizeLanguage(language);
  const normalizedToken = token.toLowerCase();

  if (normalizedLanguage === "json") {
    if (["true", "false", "null"].includes(normalizedToken)) {
      return "smartchat-token-keyword";
    }
    return "smartchat-token-plain";
  }

  if (BASE_KEYWORDS.has(normalizedToken)) {
    return "smartchat-token-keyword";
  }

  return "smartchat-token-plain";
}

function highlightCodeLine(line: string, language: string) {
  const tokenPattern = /\/\/.*|#.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match = tokenPattern.exec(line);

  while (match) {
    if (match.index > cursor) {
      nodes.push(line.slice(cursor, match.index));
    }

    const token = match[0];
    nodes.push(
      <span key={`token-${match.index}`} className={tokenClassName(token, language)}>
        {token}
      </span>,
    );

    cursor = match.index + token.length;
    match = tokenPattern.exec(line);
  }

  if (cursor < line.length) {
    nodes.push(line.slice(cursor));
  }

  if (nodes.length === 0) {
    return [<span key="empty">&nbsp;</span>];
  }

  return nodes;
}

function MarkdownMessage({ content }: { content: string }) {
  const blocks = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div className="smartchat-markdown">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 2) {
            return (
              <h2 key={`md-${index}`} className="smartchat-h2">
                {renderInline(block.text)}
              </h2>
            );
          }

          if (block.level === 3) {
            return (
              <h3 key={`md-${index}`} className="smartchat-h3">
                {renderInline(block.text)}
              </h3>
            );
          }

          return (
            <h4 key={`md-${index}`} className="smartchat-h4">
              {renderInline(block.text)}
            </h4>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={`md-${index}`} className="smartchat-paragraph">
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={`md-${index}`} className="smartchat-quote">
              {renderInline(block.text)}
            </blockquote>
          );
        }

        if (block.type === "list") {
          if (block.ordered) {
            return (
              <ol key={`md-${index}`} className="smartchat-list list-decimal">
                {block.items.map((item, itemIndex) => (
                  <li key={`item-${itemIndex}`}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          }

          return (
            <ul key={`md-${index}`} className="smartchat-list list-disc">
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        const lines = block.code.split("\n");
        const languageLabel = block.language === "text" ? "txt" : block.language;

        return (
          <figure key={`md-${index}`} className="smartchat-code-shell">
            <figcaption className="smartchat-code-header">
              <span>{languageLabel}</span>
            </figcaption>
            <pre className="smartchat-code-pre">
              <code>
                {lines.map((line, lineIndex) => (
                  <span key={`line-${lineIndex}`} className="smartchat-code-line">
                    <span className="smartchat-code-number">{String(lineIndex + 1).padStart(2, "0")}</span>
                    <span className="smartchat-code-content">{highlightCodeLine(line, block.language)}</span>
                  </span>
                ))}
              </code>
            </pre>
          </figure>
        );
      })}
    </div>
  );
}

function summarizePrompt(prompt: string) {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  return normalized;
}

function buildGermanReply(params: { prompt: string; style: StyleOption }) {
  const { prompt, style } = params;
  const lower = prompt.toLowerCase();
  const promptSummary = summarizePrompt(prompt);

  const asksForCode =
    /(code|typescript|javascript|react|next|komponente|api|refactor|debug|fehler|funktion)/i.test(
      lower,
    );
  const asksForArchitecture = /(architektur|struktur|state|zustand|thread|history|stil|datenfluss)/i.test(
    lower,
  );
  const asksForInterview = /(bewerbung|interview|ausbildung|hr|anschreiben|lebenslauf|motivation)/i.test(
    lower,
  );

  if (asksForCode) {
    return `**Demo-Modus · Lokale Antwort (${style.label})**

> Kontext erkannt: ${promptSummary || "Technische Umsetzungsfrage"}

${style.voice}

### Vorschlag in 3 Schritten
- Antwort-Streaming als inkrementelles Update in kleinen Chunks umsetzen.
- Markdown und Codeblöcke getrennt rendern, damit Highlighting stabil bleibt.
- Für mobile UX einen fixen Composer + auto-scroll auf die letzte Nachricht nutzen.

\`\`\`tsx
const reader = response.body.getReader();
const decoder = new TextDecoder();
let text = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  text += decoder.decode(value, { stream: true });
  updateMessage(text);
}
\`\`\`

### Warum das robust ist
- Sauberer, wartbarer UI-State pro Chat-Thread.
- Hohe wahrgenommene Geschwindigkeit durch Streaming.
- Performance-freundlich: Interaktionen nur über \`transform\` und \`opacity\`.`;
  }

  if (asksForArchitecture) {
    return `**Demo-Modus · Lokale Antwort (${style.label})**

> Kontext erkannt: ${promptSummary || "Architekturfrage"}

${style.voice}

### Architektur-Blueprint
1. \`threads[]\` hält Verlauf, Titel, Antwortstil und Metadaten.
2. \`activeThreadId\` steuert Fokus und Rendering der Chatfläche.
3. \`isStreaming\` verhindert konkurrierende Sends während der Ausgabe.

\`\`\`ts
type ChatThread = {
  id: string;
  title: string;
  style: "direkt" | "strukturiert" | "kompakt";
  messages: Array<{ role: "user" | "assistant"; content: string }>;
};
\`\`\`

### UX-Details für "professionell"
- Verständliche Thread-Titel aus der ersten User-Nachricht.
- Sichtbarer Live-/Demo-Status direkt neben dem Verlauf.
- Lesbare Nachrichtentypografie mit klaren Abständen.`;
  }

  if (asksForInterview) {
    return `**Demo-Modus · Lokale Antwort (${style.label})**

> Kontext erkannt: ${promptSummary || "Bewerbungsfrage"}

${style.voice}

### HR-starke Antwortstruktur
- **Ausgangslage:** kurz erklären, wie du den Einstieg in die Entwicklung gefunden hast.
- **Eigeninitiative:** konkrete Projekte nennen, die du selbst umgesetzt hast.
- **Teamwert:** zeigen, wie deine Arbeitsweise einem professionellen Entwicklungsteam hilft.

### Beispiel-Formulierung
"Meine Grundlage ist der 1. Platz unter ~6.000 Teilnehmenden im JS/FE Pre-School-Kurs von RS School / EPAM. Seit rund drei Jahren arbeite ich täglich KI-gestützt an eigenen Projekten, durchgehend auf Daten, die nie sauber waren — 20+ Projekte, 100+ Workflows. Mein Kernprojekt ist mono-api-agent: ein RAG-Agent über eine offizielle OpenAPI-Spezifikation, an einem Tag entstanden und an diesem Tag zweimal überarbeitet, weil die Messwerte es verlangten. Modelle in Produktion habe ich nicht trainiert — genau das möchte ich in einem Team lernen."

### Nächster Schritt
- Verbinde diese Aussage mit 1–2 konkreten Portfolio-Projekten.
- Halte die Antwort unter 45 Sekunden, damit sie im Interview klar wirkt.`;
  }

  return `**Demo-Modus · Lokale Antwort (${style.label})**

> Kontext erkannt: ${promptSummary || "Allgemeine Anfrage"}

${style.voice}

### Schnelle Orientierung
- Definiere zuerst das Ziel (UX, Technik oder Business-Impact).
- Setze danach einen minimalen, testbaren Scope.
- Iteriere erst dann Details wie Animationen und Feintuning.

### Mini-Plan
- Heute: funktionalen Kern bauen.
- Danach: UI polieren + Responsiveness prüfen.
- Abschluss: \`npm run build\` und technische Entscheidung dokumentieren.`;
}

function buildEnglishReply(params: { prompt: string; style: StyleOption }) {
  const { prompt, style } = params;
  const lower = prompt.toLowerCase();
  const promptSummary = summarizePrompt(prompt);

  const asksForCode = /(code|typescript|javascript|react|next|component|api|refactor|debug|function)/i.test(
    lower,
  );
  const asksForArchitecture = /(architecture|state|thread|history|style|data flow|structure)/i.test(
    lower,
  );
  const asksForInterview = /(interview|ausbildung|hr|cover letter|resume|motivation)/i.test(lower);

  if (asksForCode) {
    return `**Demo mode · Local reply (${style.label})**

> Detected context: ${promptSummary || "Technical implementation request"}

${style.voice}

### 3-step implementation
- Stream assistant output in small chunks for immediate feedback.
- Render markdown and code blocks separately for stable highlighting.
- Keep a fixed composer + auto-scroll on mobile.

\`\`\`tsx
const reader = response.body.getReader();
const decoder = new TextDecoder();
let text = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  text += decoder.decode(value, { stream: true });
  updateMessage(text);
}
\`\`\`

### Why this works well
- Clean and maintainable thread state.
- Fast perceived performance via streaming.
- Motion-safe UI: interactions rely on \`transform\` and \`opacity\`.`;
  }

  if (asksForArchitecture) {
    return `**Demo mode · Local reply (${style.label})**

> Detected context: ${promptSummary || "Architecture request"}

${style.voice}

### Architecture blueprint
1. \`threads[]\` stores history, title, answer style and metadata.
2. \`activeThreadId\` controls which conversation is rendered.
3. \`isStreaming\` blocks parallel sends while generating output.

\`\`\`ts
type ChatThread = {
  id: string;
  title: string;
  style: "direkt" | "strukturiert" | "kompakt";
  messages: Array<{ role: "user" | "assistant"; content: string }>;
};
\`\`\`

### UX details that feel professional
- Smart thread titles from the first user message.
- Visible live/demo status near chat history.
- Readable message typography with clear rhythm.`;
  }

  if (asksForInterview) {
    return `**Demo mode · Local reply (${style.label})**

> Detected context: ${promptSummary || "Interview question"}

${style.voice}

### HR-ready structure
- **Starting point:** explain briefly how you entered software development.
- **Initiative:** mention concrete projects built independently.
- **Team value:** show how your workflow helps a professional development team.

### Example phrasing
"My foundation is 1st place among ~6,000 participants in the RS School / EPAM JS/FE Pre-School course. For around three years I have worked on my own projects every day, AI-assisted, consistently on data that was never clean — 20+ projects, 100+ workflows. My core project is mono-api-agent: a RAG agent over an official OpenAPI specification, built in one day and rewritten twice that day because the measurements demanded it. I have not trained models in production — that is exactly what I want to learn inside a team."

### Next step
- Link this statement to 1–2 portfolio projects.
- Keep the spoken answer under 45 seconds for interview clarity.`;
  }

  return `**Demo mode · Local reply (${style.label})**

> Detected context: ${promptSummary || "General request"}

${style.voice}

### Quick orientation
- Start with a clear outcome (UX, engineering, business impact).
- Build the smallest testable scope first.
- Iterate details (animation polish, visual refinement) afterwards.

### Mini execution plan
- Today: ship functional core.
- Then: polish UI + validate responsiveness.
- Finish: run \`npm run build\` and document decisions.`;
}

function buildMockReply(params: { localeKey: LocaleKey; prompt: string; style: StyleOption }) {
  if (/[іїєґ]/iu.test(params.prompt)) {
    return "**Локальний демо-режим**\n\nСерверна ШІ-модель зараз недоступна, тому змістовна відповідь обмежена. Інтерфейс, історія та потокове відображення продовжують працювати. Спробуйте ще раз трохи пізніше.";
  }

  if (/[\u0400-\u04ff]/u.test(params.prompt)) {
    return "**Локальный демо-режим**\n\nСерверная ИИ-модель сейчас недоступна, поэтому содержательный ответ ограничен. Интерфейс, история и потоковое отображение продолжают работать. Попробуйте ещё раз немного позже.";
  }

  if (params.localeKey === "de") {
    return buildGermanReply({ prompt: params.prompt, style: params.style });
  }

  return buildEnglishReply({ prompt: params.prompt, style: params.style });
}

function formatTime(timestamp: number, localeKey: LocaleKey) {
  const localeTag = localeKey === "de" ? "de-DE" : "en-US";
  return new Intl.DateTimeFormat(localeTag, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(timestamp));
}

function relativeUpdatedLabel(timestamp: number, localeKey: LocaleKey) {
  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return localeKey === "de" ? "gerade eben" : "just now";
  }

  if (diffMinutes < 60) {
    return localeKey === "de" ? `vor ${diffMinutes} Min` : `${diffMinutes} min ago`;
  }

  return formatTime(timestamp, localeKey);
}

function isStoredThread(value: unknown): value is ChatThread {
  if (!value || typeof value !== "object") {
    return false;
  }

  const thread = value as ChatThread;
  return (
    typeof thread.id === "string" &&
    typeof thread.title === "string" &&
    (thread.style === "direkt" || thread.style === "strukturiert" || thread.style === "kompakt") &&
    Array.isArray(thread.messages) &&
    thread.messages.every(
      (message) =>
        message &&
        typeof message.id === "string" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
  );
}

export function SmartChatDemo({ locale }: SmartChatDemoProps) {
  const localeKey: LocaleKey = locale === "de" ? "de" : "en";
  const copy = COPY[localeKey];
  const storageKey = `smartchat-threads-v2-${localeKey}`;

  const initialThreadRef = useRef<ChatThread>(createInitialThread(copy));

  const [threads, setThreads] = useState<ChatThread[]>(() => [initialThreadRef.current]);
  const [activeThreadId, setActiveThreadId] = useState<string>(() => initialThreadRef.current.id);
  const [inputValue, setInputValue] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [engineMode, setEngineMode] = useState<EngineMode>("unknown");
  const [engineLabel, setEngineLabel] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [models, setModels] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedModel, setSelectedModel] = useState("");

  const streamTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { threads?: unknown; activeThreadId?: unknown };
        const storedThreads = Array.isArray(parsed.threads)
          ? parsed.threads.filter(isStoredThread)
          : [];
        const restoredThreads = storedThreads.map((thread) => {
          const firstUserMessage = thread.messages.find((message) => message.role === "user");
          if (!thread.title.endsWith("…") || !firstUserMessage) {
            return thread;
          }

          return {
            ...thread,
            title: createThreadTitle(firstUserMessage.content, copy.sidebar.untitled),
          };
        });

        if (restoredThreads.length > 0) {
          setThreads(restoredThreads);
          const storedActive =
            typeof parsed.activeThreadId === "string" &&
            restoredThreads.some((thread) => thread.id === parsed.activeThreadId)
              ? parsed.activeThreadId
              : restoredThreads[0].id;
          setActiveThreadId(storedActive);
        }
      }
    } catch {
      // Corrupted storage: keep the fresh initial thread.
    }

    setIsHydrated(true);
  }, [storageKey, copy.sidebar.untitled]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ threads: threads.slice(0, 20), activeThreadId }),
      );
    } catch {
      // Storage full or blocked: history persistence silently degrades.
    }
  }, [threads, activeThreadId, storageKey, isHydrated]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0] ?? null,
    [activeThreadId, threads],
  );

  const sortedThreads = useMemo(
    () => [...threads].sort((left, right) => right.updatedAt - left.updatedAt),
    [threads],
  );

  const activeStyle = useMemo(() => {
    if (!activeThread) {
      return copy.styles[0];
    }

    return copy.styles.find((item) => item.id === activeThread.style) ?? copy.styles[0];
  }, [activeThread, copy.styles]);

  const latestMessage = activeThread?.messages[activeThread.messages.length - 1] ?? null;
  const latestLength = latestMessage?.content.length ?? 0;
  const messagesCount = activeThread?.messages.length ?? 0;
  const userPromptCount = activeThread?.messages.filter((message) => message.role === "user").length ?? 0;
  const userPromptCountLabel =
    localeKey === "de"
      ? `${userPromptCount} ${userPromptCount === 1 ? "Eingabe" : "Eingaben"}`
      : `${userPromptCount} ${userPromptCount === 1 ? "prompt" : "prompts"}`;

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [activeThreadId, messagesCount, latestLength]);

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
      .then((data: { models?: Array<{ id: string; label: string }> } | null) => {
        if (cancelled || !data?.models || data.models.length === 0) {
          return;
        }
        setModels(data.models);
        setSelectedModel((current) => current || data.models![0].id);
      })
      .catch(() => {
        // Without a model list the demo silently stays in local mode.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const patchMessage = (
    threadId: string,
    messageId: string,
    content: string,
    stillStreaming: boolean,
  ) => {
    setThreads((previous) =>
      previous.map((thread) => {
        if (thread.id !== threadId) {
          return thread;
        }

        return {
          ...thread,
          updatedAt: Date.now(),
          messages: thread.messages.map((message) =>
            message.id === messageId
              ? { ...message, content, isStreaming: stillStreaming }
              : message,
          ),
        };
      }),
    );
  };

  const stopStreaming = () => {
    abortRef.current?.abort();

    if (streamTimerRef.current !== null) {
      window.clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }

    setIsStreaming(false);
    setThreads((previous) =>
      previous.map((thread) => {
        if (thread.id !== activeThreadId) {
          return thread;
        }

        return {
          ...thread,
          messages: thread.messages.map((message) =>
            message.isStreaming ? { ...message, isStreaming: false } : message,
          ),
          updatedAt: Date.now(),
        };
      }),
    );
  };

  const streamLocalMock = (threadId: string, messageId: string, fullReply: string) => {
    if (streamTimerRef.current !== null) {
      window.clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }

    let cursor = 0;

    const tick = () => {
      cursor = Math.min(fullReply.length, cursor + Math.max(3, Math.floor(Math.random() * 7)));
      patchMessage(threadId, messageId, fullReply.slice(0, cursor), cursor < fullReply.length);

      if (cursor >= fullReply.length) {
        setIsStreaming(false);
        streamTimerRef.current = null;
        return;
      }

      streamTimerRef.current = window.setTimeout(tick, 16 + Math.floor(Math.random() * 28));
    };

    tick();
  };

  const streamFromApi = async (
    threadId: string,
    messageId: string,
    history: Array<{ role: ChatRole; content: string }>,
    style: StyleOption,
    prompt: string,
  ) => {
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          style: style.id,
          locale: localeKey,
          model: selectedModel || undefined,
        }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        setEngineMode((previous) => (previous === "demo" ? "demo" : "live"));
        patchMessage(threadId, messageId, copy.status.rateLimited, false);
        setIsStreaming(false);
        return;
      }

      if (!response.ok || !response.body) {
        setEngineMode("demo");
        setEngineLabel("");
        streamLocalMock(threadId, messageId, buildMockReply({ localeKey, prompt, style }));
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
        patchMessage(threadId, messageId, accumulated, true);
      }

      if (accumulated.trim().length === 0) {
        setEngineMode("demo");
        streamLocalMock(threadId, messageId, buildMockReply({ localeKey, prompt, style }));
        return;
      }

      patchMessage(threadId, messageId, accumulated, false);
      setIsStreaming(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setIsStreaming(false);
        return;
      }

      setEngineMode("demo");
      setEngineLabel("");
      streamLocalMock(threadId, messageId, buildMockReply({ localeKey, prompt, style }));
    } finally {
      abortRef.current = null;
    }
  };

  const handleCreateThread = () => {
    if (isStreaming) {
      return;
    }

    const timestamp = Date.now();
    const nextThread: ChatThread = {
      id: createId("thread"),
      title: copy.sidebar.untitled,
      style: activeStyle?.id ?? copy.styles[0]?.id ?? "direkt",
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: [
        {
          id: createId("msg"),
          role: "assistant",
          content: copy.chat.welcomeMessage,
          createdAt: timestamp,
        },
      ],
    };

    setThreads((previous) => [nextThread, ...previous]);
    setActiveThreadId(nextThread.id);
    setInputValue("");
    textareaRef.current?.focus();
  };

  const handleStyleChange = (styleId: StyleKey) => {
    if (!activeThread || isStreaming) {
      return;
    }

    setThreads((previous) =>
      previous.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              style: styleId,
              updatedAt: Date.now(),
            }
          : thread,
      ),
    );
  };

  const sendMessage = () => {
    if (!activeThread || isStreaming) {
      return;
    }

    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = Date.now();
    const userMessage: ChatMessage = {
      id: createId("msg"),
      role: "user",
      content: trimmed,
      createdAt: timestamp,
    };

    const assistantMessage: ChatMessage = {
      id: createId("msg"),
      role: "assistant",
      content: "",
      createdAt: timestamp,
      isStreaming: true,
    };

    const nextTitle =
      activeThread.messages.some((message) => message.role === "user")
        ? activeThread.title
        : createThreadTitle(trimmed, copy.sidebar.untitled);

    const selectedStyle = copy.styles.find((style) => style.id === activeThread.style) ?? copy.styles[0];

    // History for the model: skip the local welcome message, keep the last turns.
    const history = [...activeThread.messages, userMessage]
      .filter((message, index) => !(index === 0 && message.role === "assistant"))
      .filter((message) => message.content.trim().length > 0)
      .slice(-10)
      .map((message) => ({ role: message.role, content: message.content }));

    setThreads((previous) =>
      previous.map((thread) => {
        if (thread.id !== activeThread.id) {
          return thread;
        }

        return {
          ...thread,
          title: nextTitle,
          updatedAt: timestamp,
          messages: [...thread.messages, userMessage, assistantMessage],
        };
      }),
    );

    setInputValue("");
    setIsStreaming(true);
    void streamFromApi(activeThread.id, assistantMessage.id, history, selectedStyle, trimmed);
  };

  if (!activeThread) {
    return null;
  }

  const statusChip =
    engineMode === "live" ? (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] text-accent uppercase"
        title={engineLabel}
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
        {copy.status.live}
        {engineLabel ? ` · ${engineLabel}` : ""}
      </span>
    ) : engineMode === "demo" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-muted" />
        {copy.status.demo}
      </span>
    ) : null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {copy.badge}
          </span>
          {statusChip}
          <Link
            href="/#projects"
            className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            ← {copy.back}
          </Link>
        </div>

        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-4xl leading-relaxed text-muted">{copy.subtitle}</p>

        <ul className="mt-5 flex flex-wrap gap-2.5">
          {copy.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-[11px] font-medium text-muted"
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[290px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{copy.sidebar.historyTitle}</h2>
              <button
                type="button"
                onClick={handleCreateThread}
                disabled={isStreaming}
                className="smartchat-ghost-btn rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted"
              >
                + {copy.sidebar.newChat}
              </button>
            </div>
            <p className="text-sm leading-relaxed text-muted">{copy.sidebar.historyHint}</p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-3">
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
              {copy.sidebar.styleTitle}
            </p>
            <p className="mt-1 text-xs text-muted">{copy.sidebar.styleHint}</p>

            <ul className="mt-2 space-y-2">
              {copy.styles.map((style) => {
                const isActive = activeThread.style === style.id;
                return (
                  <li key={style.id}>
                    <button
                      type="button"
                      onClick={() => handleStyleChange(style.id)}
                      disabled={isStreaming}
                      aria-pressed={isActive}
                      className={`smartchat-model-btn w-full rounded-xl border px-3 py-2.5 text-left ${
                        isActive
                          ? "border-primary/45 bg-primary/12"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{style.label}</p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                            isActive
                              ? "border-primary/35 bg-primary/15 text-primary"
                              : "border-border text-muted"
                          }`}
                        >
                          {style.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{style.description}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {models.length > 0 ? (
            <div className="rounded-2xl border border-border bg-background/70 p-3">
              <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                {copy.sidebar.modelTitle}
              </p>
              <label className="mt-2 block">
                <span className="sr-only">{copy.sidebar.modelTitle}</span>
                <select
                  value={selectedModel}
                  onChange={(event) => setSelectedModel(event.target.value)}
                  disabled={isStreaming}
                  className="contact-field w-full rounded-xl px-3 py-2 text-sm"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{copy.sidebar.modelHint}</p>
            </div>
          ) : null}

          <ul className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {sortedThreads.map((thread) => {
              const isActive = thread.id === activeThread.id;
              const lastMessage = thread.messages[thread.messages.length - 1];
              const threadStatus = lastMessage?.isStreaming
                ? copy.chat.typing
                : localeKey === "de"
                  ? `${thread.messages.length} ${thread.messages.length === 1 ? "Nachricht" : "Nachrichten"}`
                  : `${thread.messages.length} ${thread.messages.length === 1 ? "message" : "messages"}`;

              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isStreaming) {
                        return;
                      }
                      setActiveThreadId(thread.id);
                    }}
                    aria-pressed={isActive}
                    className={`smartchat-thread-btn w-full rounded-2xl border p-3 text-left ${
                      isActive
                        ? "is-active border-primary/45 bg-primary/10"
                        : "border-border bg-background/75"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 text-sm font-semibold leading-snug text-foreground">
                        {thread.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted">
                        {isHydrated ? relativeUpdatedLabel(thread.updatedAt, localeKey) : "—"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{threadStatus}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{activeThread.title}</p>
              <p className="mt-1 text-xs text-muted">
                {activeStyle?.label} · {activeStyle?.badge}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="smartchat-ghost-btn rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted"
                >
                  {copy.composer.stop}
                </button>
              ) : null}
              <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted">
                {userPromptCountLabel}
              </span>
            </div>
          </div>

          <div
            ref={messagesRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label={localeKey === "de" ? "Chatverlauf" : "Chat log"}
            className="mt-4 h-[360px] space-y-3 overflow-y-auto rounded-2xl border border-border bg-background/60 p-3 sm:h-[460px] sm:p-4"
          >
            {activeThread.messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">{copy.chat.emptyTitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{copy.chat.emptyText}</p>
              </div>
            ) : null}

            {activeThread.messages.map((message) => {
              const isAssistant = message.role === "assistant";
              const messageTime = isHydrated ? formatTime(message.createdAt, localeKey) : "—";

              return (
                <article
                  key={message.id}
                  className={`smartchat-message flex ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[94%] break-words rounded-2xl border px-3.5 py-3 sm:max-w-[88%] sm:px-4 ${
                      isAssistant
                        ? "border-border bg-card"
                        : "border-primary/28 bg-primary/12"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                        {isAssistant ? copy.chat.assistantLabel : copy.chat.userLabel}
                      </p>
                      <p className="text-[11px] text-muted">
                        {copy.chat.generatedAt} {messageTime}
                      </p>
                    </div>

                    {isAssistant ? (
                      message.content ? (
                        <div className="mt-2.5">
                          <MarkdownMessage content={message.content} />
                        </div>
                      ) : (
                        <p className="mt-2.5 flex items-center gap-1.5 text-sm text-muted">
                          <span className="smartchat-dot" />
                          <span className="smartchat-dot" />
                          <span className="smartchat-dot" />
                          {copy.chat.typing}
                        </p>
                      )
                    ) : (
                      <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {message.content}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-background/70 p-3 sm:p-4">
            <p className="font-mono text-[11px] font-semibold tracking-[0.13em] text-primary uppercase">
              {copy.quickPromptsTitle}
            </p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {copy.quickPrompts.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isStreaming) {
                        return;
                      }
                      setInputValue(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="smartchat-ghost-btn w-full rounded-xl border border-border bg-card px-3 py-2 text-left text-xs leading-relaxed text-muted"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-background/75 p-3 sm:p-4">
            <label htmlFor="smartchat-input" className="sr-only">
              SmartChat prompt
            </label>
            <textarea
              id="smartchat-input"
              ref={textareaRef}
              rows={4}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={copy.composer.placeholder}
              className="contact-field w-full resize-y rounded-2xl px-3.5 py-3 text-sm"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted">{copy.composer.hint}</p>
              <button
                type="button"
                onClick={sendMessage}
                disabled={isStreaming || !inputValue.trim()}
                className="contact-submit inline-flex w-full items-center justify-center rounded-full bg-primary-solid px-4 py-2 text-sm font-semibold text-white sm:min-w-[132px] sm:w-auto"
              >
                {isStreaming ? copy.composer.sending : copy.composer.send}
              </button>
            </div>
          </div>
        </section>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted">
        {engineMode === "live" || (engineMode === "unknown" && models.length > 0)
          ? copy.footerNoteLive
          : copy.footerNoteDemo}
      </p>
    </main>
  );
}
