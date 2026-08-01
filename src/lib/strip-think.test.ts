import { describe, expect, it } from "vitest";
import { createThinkStripper } from "./strip-think";

function run(chunks: string[]): string {
  const stripper = createThinkStripper();
  let out = "";
  for (const chunk of chunks) {
    out += stripper.process(chunk);
  }
  return out + stripper.flush();
}

describe("createThinkStripper", () => {
  it("passes plain text through unchanged", () => {
    expect(run(["Dear team,", " here is my letter."])).toBe("Dear team, here is my letter.");
  });

  it("removes a think block inside a single chunk", () => {
    expect(run(["<think>secret reasoning</think>Dear team,"])).toBe("Dear team,");
  });

  it("removes a think block split across chunks", () => {
    expect(run(["<thi", "nk>let me analyze", " the vacancy</thi", "nk>Dear team,"])).toBe(
      "Dear team,",
    );
  });

  it("removes multiple think blocks and keeps surrounding text", () => {
    expect(run(["A<think>x</think>B<think>y</think>C"])).toBe("ABC");
  });

  it("drops an unterminated think block entirely", () => {
    expect(run(["<think>reasoning that never closes", " and keeps going"])).toBe("");
  });

  it("emits a partial '<think' prefix that never becomes a tag", () => {
    expect(run(["value <thin", "king about it"])).toBe("value <thinking about it");
  });

  it("emits a trailing partial prefix on flush", () => {
    expect(run(["letter text <th"])).toBe("letter text <th");
  });
});
