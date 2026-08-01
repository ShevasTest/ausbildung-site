export type VacancyLocale = "de" | "en";

function normalizeCompany(rawValue: string) {
  return rawValue
    .replace(/[|,;:\n]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^(?:ein(?:e|en|em|er|es)?|a|an|the)\s+/i, "")
    .replace(/[.!?]$/, "")
    .trim();
}

export function extractCompany(vacancyText: string) {
  const patterns = [
    /^([A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9&.\- ]{2,64}?)\s+(?:sucht|stellt\s+ein|sucht\s+zum|is\s+hiring|hires|is\s+looking)/im,
    /(?:unternehmen|arbeitgeber|company|employer)\s*[:\-]\s*([A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9&.\- ]{2,64})/i,
    /(?:bei|at)\s+([A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9&.\- ]{2,64}?)(?=[,;:\n]|\s+(?:in|als|as|suchen|we|you))/i,
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

export function extractRole(vacancyText: string, fallbackRole: string, locale: VacancyLocale) {
  const text = vacancyText.toLowerCase();
  const isTrainingRole = /ausbildung|auszubild|apprentice|trainee/.test(text);
  const isJuniorRole = /junior|entry[ -]level|berufseinsteiger/.test(text);

  if (text.includes("fachinformatiker") && text.includes("anwendungsentwicklung")) {
    return locale === "de"
      ? "Fachinformatiker/in für Anwendungsentwicklung (m/w/d)"
      : "Fachinformatiker for Application Development (m/f/d)";
  }

  if (text.includes("frontend")) {
    if (isTrainingRole) {
      return locale === "de"
        ? "Frontend-Entwicklung / Ausbildung (m/w/d)"
        : "Frontend Development / Ausbildung (m/f/d)";
    }

    return locale === "de"
      ? `${isJuniorRole ? "Junior " : ""}Frontend Developer (m/w/d)`
      : `${isJuniorRole ? "Junior " : ""}Frontend Developer (m/f/d)`;
  }

  if (text.includes("fullstack") || text.includes("full-stack")) {
    return locale === "de" ? "Full-Stack-Entwicklung (m/w/d)" : "Full-Stack Development (m/f/d)";
  }

  if (text.includes("ausbildung") && (text.includes("software") || text.includes("development"))) {
    return locale === "de"
      ? "Ausbildung im Bereich Softwareentwicklung (m/w/d)"
      : "Software Development Ausbildung (m/f/d)";
  }

  if (text.includes("softwareentwickler") || text.includes("software developer")) {
    return locale === "de"
      ? `${isJuniorRole ? "Junior-" : ""}Softwareentwickler/in (m/w/d)`
      : `${isJuniorRole ? "Junior " : ""}Software Developer (m/f/d)`;
  }

  return fallbackRole;
}
