import { describe, expect, it } from "vitest";
import { buildChatSystemPrompt } from "./chat-prompt";

describe("buildChatSystemPrompt", () => {
  it("matches Russian input and does not reject ordinary questions", () => {
    const prompt = buildChatSystemPrompt({
      style: "direkt",
      locale: "de",
      latestUserMessage: "Какая сейчас погода в Мюнхене?",
    });

    expect(prompt).toContain("reply in that same language");
    expect(prompt).toContain("current weather");
    expect(prompt).toContain("cannot fetch the current value");
    expect(prompt).toContain("instead of rejecting them");
  });

  it("grounds portfolio claims honestly", () => {
    const prompt = buildChatSystemPrompt({
      style: "strukturiert",
      locale: "de",
      latestUserMessage: "Was kann Oleksandr besonders gut?",
    });

    expect(prompt).toContain("20+ personal projects");
    expect(prompt).toContain("100+ scripts/automations");
    expect(prompt).toContain("Do not present him as an independent TypeScript, React or Next.js expert");
  });

  it("contains the actual streaming architecture", () => {
    const prompt = buildChatSystemPrompt({
      style: "kompakt",
      locale: "en",
      latestUserMessage: "How does streaming work in this chat?",
    });

    expect(prompt).toContain("fetch ReadableStream");
    expect(prompt).toContain("does not use SSE, WebSockets or long polling");
    expect(prompt).toContain("/api/chat");
  });
});
