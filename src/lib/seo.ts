export const siteConfig = {
  baseUrl: "https://alex-ausbildung-portfolio.vercel.app",
  siteName: "Oleksandr Portfolio",
  authorName: "Oleksandr Shevchenko",
  githubUrl: "https://github.com/ShevasTest",
  linkedInUrl: "https://www.linkedin.com/in/oleksandr-it/",
  email: "oleksandr.o.shevchenko@gmail.com",
} as const;

export type AppLocale = "de" | "en";

export function normalizeLocale(locale: string): AppLocale {
  return locale === "en" ? "en" : "de";
}

export function localeToLanguageTag(locale: AppLocale) {
  return locale === "de" ? "de-DE" : "en-US";
}

export function localeToOpenGraphLocale(locale: AppLocale) {
  return locale === "de" ? "de_DE" : "en_US";
}

export function localizedPath(locale: string, path = "/") {
  const safeLocale = normalizeLocale(locale);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (safeLocale === "de") {
    return normalizedPath === "/" ? "/de" : `/de${normalizedPath}`;
  }

  return normalizedPath === "/" ? "/en" : `/en${normalizedPath}`;
}

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.baseUrl).toString();
}

export function toJsonLd(value: object | object[]) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
