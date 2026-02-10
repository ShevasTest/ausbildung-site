"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type LocaleKey = "de" | "en";
type ModelKey = "gpt4o" | "claude-sonnet" | "llama";
type ChatRole = "user" | "assistant";

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
  model: ModelKey;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

type ModelOption = {
  id: ModelKey;
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
  composer: {
    placeholder: string;
    send: string;
    sending: string;
    stop: string;
    hint: string;
  };
  quickPromptsTitle: string;
  quickPrompts: string[];
  footerNote: string;
  models: ModelOption[];
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
    badge: "Live-Demo · SmartChat ohne API-Key",
    title: "SmartChat",
    subtitle:
      "ChatGPT-ähnliche Oberfläche mit Chat-Verlauf, Modellwahl, Streaming-Antworten, Markdown-Rendering und Code-Highlighting. Alles läuft lokal mit realistischen Mock-Antworten.",
    back: "Zurück zur Startseite",
    chips: ["Streaming", "Markdown + Code", "Chat-Verlauf", "Modellauswahl"],
    sidebar: {
      historyTitle: "Chat-Verlauf",
      historyHint: "Unterhaltungen bleiben im aktuellen Demo-Lauf erhalten und zeigen typische Produkt-UX.",
      newChat: "Neue Unterhaltung",
      modelTitle: "Modell wählen",
      modelHint: "Jeder Thread kann ein anderes Modellprofil nutzen.",
      untitled: "Neue Unterhaltung",
    },
    chat: {
      assistantLabel: "SmartChat",
      userLabel: "Sie",
      welcomeMessage:
        "Hallo! Ich bin **SmartChat** — ein Demo-Assistent für Ihr Ausbildung-Portfolio.\n\n- Schreiben Sie eine Frage oder eine Aufgabe.\n- Ich antworte mit **Streaming-Ausgabe** wie in echten AI-Tools.\n- Ich kann `Markdown` und Codeblöcke darstellen.\n\nTipp: Fragen Sie z. B. nach einer Next.js-Komponente oder einer kurzen Architektur-Idee.",
      typing: "Antwort wird gestreamt ...",
      emptyTitle: "Noch keine Nachrichten",
      emptyText: "Starten Sie links eine neue Unterhaltung und schicken Sie rechts Ihre erste Nachricht.",
      generatedAt: "um",
    },
    composer: {
      placeholder:
        "Fragen Sie etwas Konkretes: z. B. \"Wie baue ich Streaming in Next.js ohne API-Key-Demo?\"", 
      send: "Senden",
      sending: "Streaming ...",
      stop: "Stoppen",
      hint: "Enter = senden · Shift + Enter = neue Zeile",
    },
    quickPromptsTitle: "Schnellstarts",
    quickPrompts: [
      "Gib mir ein TypeScript-Beispiel für einen Streaming-Chat in React.",
      "Wie erkläre ich Eigeninitiative im Vorstellungsgespräch auf Deutsch?",
      "Entwirf eine klare Architektur für Chat-Verlauf + Modellauswahl.",
      "Welche 3 UX-Details machen einen Chat wie ChatGPT professionell?",
    ],
    footerNote:
      "Hinweis: Demo mit lokal generierten Antworten (kein externes LLM, keine API-Anfrage). Fokus liegt auf UX, Architektur und Produktreife.",
    models: [
      {
        id: "gpt4o",
        label: "GPT-4o",
        badge: "Schnell + präzise",
        description: "Direkte, klare Antwortstruktur mit Fokus auf umsetzbare Schritte.",
        voice: "Ich gehe direkt auf die Kernfrage und liefere sofort umsetzbare Bausteine.",
      },
      {
        id: "claude-sonnet",
        label: "Claude Sonnet",
        badge: "Strukturiert",
        description: "Mehr Kontext, saubere Gliederung und Begründung der Entscheidungen.",
        voice: "Ich strukturiere die Antwort stärker und begründe kurz die technischen Trade-offs.",
      },
      {
        id: "llama",
        label: "Llama 3.1",
        badge: "Pragmatisch",
        description: "Kompakte Antwort mit Fokus auf robuste Basislösung.",
        voice: "Ich priorisiere pragmatische Lösungen, die schnell stabil laufen.",
      },
    ],
  },
  en: {
    badge: "Live demo · SmartChat without API key",
    title: "SmartChat",
    subtitle:
      "ChatGPT-like interface with chat history, model selector, streaming replies, markdown rendering and code highlighting. Everything runs locally with realistic mock answers.",
    back: "Back to homepage",
    chips: ["Streaming", "Markdown + code", "Chat history", "Model selector"],
    sidebar: {
      historyTitle: "Chat history",
      historyHint: "Conversations persist during this demo session to mirror product-like UX.",
      newChat: "New conversation",
      modelTitle: "Choose model",
      modelHint: "Each thread can run with a different model profile.",
      untitled: "New conversation",
    },
    chat: {
      assistantLabel: "SmartChat",
      userLabel: "You",
      welcomeMessage:
        "Hi! I am **SmartChat** — a demo assistant for this Ausbildung portfolio.\n\n- Ask a question or define a task.\n- I answer with **streaming output** like real AI products.\n- I can render `Markdown` and highlighted code blocks.\n\nTip: ask for a Next.js component or a short architecture proposal.",
      typing: "Streaming response ...",
      emptyTitle: "No messages yet",
      emptyText: "Create a thread on the left and send your first message.",
      generatedAt: "at",
    },
    composer: {
      placeholder:
        "Ask something specific, e.g. \"How do I build streaming UI in Next.js for a mock AI demo?\"",
      send: "Send",
      sending: "Streaming ...",
      stop: "Stop",
      hint: "Enter = send · Shift + Enter = newline",
    },
    quickPromptsTitle: "Quick starters",
    quickPrompts: [
      "Show me a TypeScript example for a streaming chat in React.",
      "How can I explain initiative in a German Ausbildung interview?",
      "Design a clean architecture for history + model selection.",
      "Which 3 UX details make a chat app feel professional?",
    ],
    footerNote:
      "Note: this demo uses local mock generation (no external LLM requests). It showcases UX quality, architecture and implementation depth.",
    models: [
      {
        id: "gpt4o",
        label: "GPT-4o",
        badge: "Fast + precise",
        description: "Direct, implementation-oriented replies with clear action points.",
        voice: "I keep it concise and highly actionable.",
      },
      {
        id: "claude-sonnet",
        label: "Claude Sonnet",
        badge: "Structured",
        description: "More context, clean hierarchy and quick trade-off explanation.",
        voice: "I prioritize structure and explicit reasoning.",
      },
      {
        id: "llama",
        label: "Llama 3.1",
        badge: "Pragmatic",
        description: "Compact answer focused on robust baseline implementation.",
        voice: "I focus on practical solutions that work quickly and reliably.",
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
  if (!normalized) {
    return fallback;
  }

  return normalized.length > 44 ? `${normalized.slice(0, 43)}…` : normalized;
}

function createInitialThread(copy: DemoCopy): ChatThread {
  const timestamp = Date.now();
  return {
    id: createId("thread"),
    title: copy.sidebar.untitled,
    model: copy.models[0]?.id ?? "gpt4o",
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

  return normalized.length > 95 ? `${normalized.slice(0, 94)}…` : normalized;
}

function buildGermanReply(params: { prompt: string; model: ModelOption }) {
  const { prompt, model } = params;
  const lower = prompt.toLowerCase();
  const promptSummary = summarizePrompt(prompt);

  const asksForCode =
    /(code|typescript|javascript|react|next|komponente|api|refactor|debug|fehler|funktion)/i.test(
      lower,
    );
  const asksForArchitecture = /(architektur|struktur|state|zustand|thread|history|modell|datenfluss)/i.test(
    lower,
  );
  const asksForInterview = /(bewerbung|interview|ausbildung|hr|anschreiben|lebenslauf|motivation)/i.test(
    lower,
  );

  if (asksForCode) {
    return `**${model.label} · Mock Antwort**

> Kontext erkannt: ${promptSummary || "Technische Umsetzungsfrage"}

${model.voice}

### Vorschlag in 3 Schritten
- Antwort-Streaming als inkrementelles Update in kleinen Chunks umsetzen.
- Markdown und Codeblöcke getrennt rendern, damit Highlighting stabil bleibt.
- Für mobile UX einen fixen Composer + auto-scroll auf die letzte Nachricht nutzen.

\`\`\`tsx
type StreamState = {
  fullText: string;
  cursor: number;
};

const nextChunk = ({ fullText, cursor }: StreamState) =>
  fullText.slice(0, Math.min(fullText.length, cursor + 6));

const frameDelay = 18 + Math.floor(Math.random() * 24);
\`\`\`

### Warum das robust ist
- Sauberer, wartbarer UI-State pro Chat-Thread.
- Hohe wahrgenommene Geschwindigkeit durch Streaming.
- Performance-freundlich: Interaktionen nur über \`transform\` und \`opacity\`.`;
  }

  if (asksForArchitecture) {
    return `**${model.label} · Mock Antwort**

> Kontext erkannt: ${promptSummary || "Architekturfrage"}

${model.voice}

### Architektur-Blueprint
1. \`threads[]\` hält Verlauf, Titel, Modell und Metadaten.
2. \`activeThreadId\` steuert Fokus und Rendering der Chatfläche.
3. \`isStreaming\` verhindert konkurrierende Sends während der Ausgabe.

\`\`\`ts
type ChatThread = {
  id: string;
  title: string;
  model: "gpt4o" | "claude-sonnet" | "llama";
  messages: Array<{ role: "user" | "assistant"; content: string }>;
};
\`\`\`

### UX-Details für "professionell"
- Verständliche Thread-Titel aus der ersten User-Nachricht.
- Sichtbarer Modellstatus direkt neben dem Verlauf.
- Lesbare Nachrichtentypografie mit klaren Abständen für HR-Scannbarkeit.`;
  }

  if (asksForInterview) {
    return `**${model.label} · Mock Antwort**

> Kontext erkannt: ${promptSummary || "Bewerbungsfrage"}

${model.voice}

### HR-starke Antwortstruktur
- **Ausgangslage:** kurz erklären, wie du den Einstieg in die Entwicklung gefunden hast.
- **Eigeninitiative:** konkrete Projekte nennen, die du selbst umgesetzt hast.
- **Teamwert:** zeigen, wie deine Arbeitsweise einem Ausbildungsteam hilft.

### Beispiel-Formulierung
"Ich habe mir Frontend-Entwicklung im Selbststudium aufgebaut und komplette Projekte umgesetzt — inklusive responsiver UI, sauberem TypeScript und Performance-Checks. Damit bringe ich nicht nur Lernbereitschaft, sondern bereits belastbare Praxis in ein Ausbildungsteam mit."

### Nächster Schritt
- Verbinde diese Aussage mit 1–2 konkreten Portfolio-Projekten.
- Halte die Antwort unter 45 Sekunden, damit sie im Interview klar wirkt.`;
  }

  return `**${model.label} · Mock Antwort**

> Kontext erkannt: ${promptSummary || "Allgemeine Anfrage"}

${model.voice}

### Schnelle Orientierung
- Definiere zuerst das Ziel (UX, Technik oder Business-Impact).
- Setze danach einen minimalen, testbaren Scope.
- Iteriere erst dann Details wie Animationen und Feintuning.

### Mini-Plan
- Heute: funktionalen Kern bauen.
- Danach: UI polieren + Responsiveness prüfen.
- Abschluss: \`npm run build\` und technische Entscheidung dokumentieren.`;
}

function buildEnglishReply(params: { prompt: string; model: ModelOption }) {
  const { prompt, model } = params;
  const lower = prompt.toLowerCase();
  const promptSummary = summarizePrompt(prompt);

  const asksForCode = /(code|typescript|javascript|react|next|component|api|refactor|debug|function)/i.test(
    lower,
  );
  const asksForArchitecture = /(architecture|state|thread|history|model|data flow|structure)/i.test(
    lower,
  );
  const asksForInterview = /(interview|ausbildung|hr|cover letter|resume|motivation)/i.test(lower);

  if (asksForCode) {
    return `**${model.label} · Mock response**

> Detected context: ${promptSummary || "Technical implementation request"}

${model.voice}

### 3-step implementation
- Stream assistant output in small chunks for immediate feedback.
- Render markdown and code blocks separately for stable highlighting.
- Keep a fixed composer + auto-scroll on mobile.

\`\`\`tsx
type StreamState = {
  fullText: string;
  cursor: number;
};

const nextChunk = ({ fullText, cursor }: StreamState) =>
  fullText.slice(0, Math.min(fullText.length, cursor + 6));

const frameDelay = 18 + Math.floor(Math.random() * 24);
\`\`\`

### Why this works well
- Clean and maintainable thread state.
- Fast perceived performance via streaming.
- Motion-safe UI: interactions rely on \`transform\` and \`opacity\`.`;
  }

  if (asksForArchitecture) {
    return `**${model.label} · Mock response**

> Detected context: ${promptSummary || "Architecture request"}

${model.voice}

### Architecture blueprint
1. \`threads[]\` stores history, title, model and metadata.
2. \`activeThreadId\` controls which conversation is rendered.
3. \`isStreaming\` blocks parallel sends while generating output.

\`\`\`ts
type ChatThread = {
  id: string;
  title: string;
  model: "gpt4o" | "claude-sonnet" | "llama";
  messages: Array<{ role: "user" | "assistant"; content: string }>;
};
\`\`\`

### UX details that feel professional
- Smart thread titles from the first user message.
- Visible model status near chat history.
- Readable message typography with clear rhythm.`;
  }

  if (asksForInterview) {
    return `**${model.label} · Mock response**

> Detected context: ${promptSummary || "Interview question"}

${model.voice}

### HR-ready structure
- **Starting point:** explain briefly how you entered software development.
- **Initiative:** mention concrete projects built independently.
- **Team value:** show how your workflow helps an Ausbildung team.

### Example phrasing
"I built my frontend foundation through structured self-learning and delivered complete projects with responsive UI, clean TypeScript and performance checks. This means I bring not only motivation, but already practical implementation skills to an Ausbildung team."

### Next step
- Link this statement to 1–2 portfolio projects.
- Keep the spoken answer under 45 seconds for interview clarity.`;
  }

  return `**${model.label} · Mock response**

> Detected context: ${promptSummary || "General request"}

${model.voice}

### Quick orientation
- Start with a clear outcome (UX, engineering, business impact).
- Build the smallest testable scope first.
- Iterate details (animation polish, visual refinement) afterwards.

### Mini execution plan
- Today: ship functional core.
- Then: polish UI + validate responsiveness.
- Finish: run \`npm run build\` and document decisions.`;
}

function buildMockReply(params: { localeKey: LocaleKey; prompt: string; model: ModelOption }) {
  if (params.localeKey === "de") {
    return buildGermanReply({ prompt: params.prompt, model: params.model });
  }

  return buildEnglishReply({ prompt: params.prompt, model: params.model });
}

function formatTime(timestamp: number, localeKey: LocaleKey) {
  const localeTag = localeKey === "de" ? "de-DE" : "en-US";
  return new Intl.DateTimeFormat(localeTag, {
    hour: "2-digit",
    minute: "2-digit",
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

export function SmartChatDemo({ locale }: SmartChatDemoProps) {
  const localeKey: LocaleKey = locale === "de" ? "de" : "en";
  const copy = COPY[localeKey];

  const initialThreadRef = useRef<ChatThread>(createInitialThread(copy));

  const [threads, setThreads] = useState<ChatThread[]>(() => [initialThreadRef.current]);
  const [activeThreadId, setActiveThreadId] = useState<string>(() => initialThreadRef.current.id);
  const [inputValue, setInputValue] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  const streamTimerRef = useRef<number | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0] ?? null,
    [activeThreadId, threads],
  );

  const sortedThreads = useMemo(
    () => [...threads].sort((left, right) => right.updatedAt - left.updatedAt),
    [threads],
  );

  const activeModel = useMemo(() => {
    if (!activeThread) {
      return copy.models[0];
    }

    return copy.models.find((item) => item.id === activeThread.model) ?? copy.models[0];
  }, [activeThread, copy.models]);

  const latestMessage = activeThread?.messages[activeThread.messages.length - 1] ?? null;
  const latestLength = latestMessage?.content.length ?? 0;
  const messagesCount = activeThread?.messages.length ?? 0;

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
    };
  }, []);

  const stopStreaming = () => {
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

  const startStreaming = (threadId: string, messageId: string, fullReply: string) => {
    if (streamTimerRef.current !== null) {
      window.clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }

    setIsStreaming(true);
    let cursor = 0;

    const tick = () => {
      cursor = Math.min(fullReply.length, cursor + Math.max(3, Math.floor(Math.random() * 7)));

      setThreads((previous) =>
        previous.map((thread) => {
          if (thread.id !== threadId) {
            return thread;
          }

          return {
            ...thread,
            updatedAt: Date.now(),
            messages: thread.messages.map((message) => {
              if (message.id !== messageId) {
                return message;
              }

              return {
                ...message,
                content: fullReply.slice(0, cursor),
                isStreaming: cursor < fullReply.length,
              };
            }),
          };
        }),
      );

      if (cursor >= fullReply.length) {
        setIsStreaming(false);
        streamTimerRef.current = null;
        return;
      }

      streamTimerRef.current = window.setTimeout(tick, 16 + Math.floor(Math.random() * 28));
    };

    tick();
  };

  const handleCreateThread = () => {
    if (isStreaming) {
      return;
    }

    const timestamp = Date.now();
    const nextThread: ChatThread = {
      id: createId("thread"),
      title: copy.sidebar.untitled,
      model: activeModel?.id ?? copy.models[0]?.id ?? "gpt4o",
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

  const handleModelChange = (modelId: ModelKey) => {
    if (!activeThread || isStreaming) {
      return;
    }

    setThreads((previous) =>
      previous.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              model: modelId,
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

    const selectedModel = copy.models.find((model) => model.id === activeThread.model) ?? copy.models[0];
    const fullReply = buildMockReply({ localeKey, prompt: trimmed, model: selectedModel });

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
    startStreaming(activeThread.id, assistantMessage.id, fullReply);
  };

  if (!activeThread) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
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
            <li
              key={chip}
              className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-muted"
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
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              {copy.sidebar.modelTitle}
            </p>
            <p className="mt-1 text-xs text-muted">{copy.sidebar.modelHint}</p>

            <ul className="mt-2 space-y-2">
              {copy.models.map((model) => {
                const isActive = activeThread.model === model.id;
                return (
                  <li key={model.id}>
                    <button
                      type="button"
                      onClick={() => handleModelChange(model.id)}
                      disabled={isStreaming}
                      aria-pressed={isActive}
                      className={`smartchat-model-btn w-full rounded-xl border px-3 py-2.5 text-left ${
                        isActive
                          ? "border-primary/45 bg-primary/12"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{model.label}</p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                            isActive
                              ? "border-primary/35 bg-primary/15 text-primary"
                              : "border-border text-muted"
                          }`}
                        >
                          {model.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{model.description}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <ul className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {sortedThreads.map((thread) => {
              const isActive = thread.id === activeThread.id;
              const lastMessage = thread.messages[thread.messages.length - 1];
              const preview =
                lastMessage?.content.trim() || (lastMessage?.isStreaming ? copy.chat.typing : "...");

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
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">{thread.title}</p>
                      <span className="text-[11px] text-muted">
                        {relativeUpdatedLabel(thread.updatedAt, localeKey)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{preview}</p>
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
                {activeModel?.label} · {activeModel?.badge}
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
                {activeThread.messages.filter((message) => message.role === "user").length} prompts
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
              const messageTime = formatTime(message.createdAt, localeKey);

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
            <p className="text-xs font-semibold tracking-[0.13em] text-primary uppercase">
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

      <p className="mt-5 text-xs leading-relaxed text-muted">{copy.footerNote}</p>
    </main>
  );
}
