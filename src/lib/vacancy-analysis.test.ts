import { describe, expect, it } from "vitest";
import { extractCompany, extractRole } from "./vacancy-analysis";

describe("vacancy analysis", () => {
  it("extracts the company from the German startup preset", () => {
    const text =
      "Ein Berliner SaaS-Start-up sucht zum 01.08.2026 Auszubildende (m/w/d) zum Fachinformatiker für Anwendungsentwicklung.";

    expect(extractCompany(text)).toBe("Berliner SaaS-Start-up");
  });

  it("does not confuse a role phrase with a company", () => {
    const text =
      "Für unsere zentrale IT in München suchen wir Auszubildende zum Fachinformatiker für Anwendungsentwicklung.";

    expect(extractCompany(text)).toBe("");
  });

  it("localizes detected roles", () => {
    const text = "We are hiring for a frontend Ausbildung with React.";

    expect(extractRole(text, "fallback", "en")).toBe("Frontend Development / Ausbildung (m/f/d)");
    expect(extractRole(text, "fallback", "de")).toBe("Frontend-Entwicklung / Ausbildung (m/w/d)");
  });
});
