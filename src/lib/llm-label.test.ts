import { describe, expect, it } from "vitest";
import { decodeLlmLabel, encodeLlmLabel } from "./llm-label";

describe("LLM response labels", () => {
  it("round-trips provider labels through ASCII-safe headers", () => {
    const label = "Llama 3.3 70B · Groq";

    expect(decodeLlmLabel(encodeLlmLabel(label))).toBe(label);
  });

  it("keeps malformed external labels readable", () => {
    expect(decodeLlmLabel("Model%ZZName")).toBe("Model%ZZName");
    expect(decodeLlmLabel(null)).toBe("");
  });
});
