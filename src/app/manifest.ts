import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oleksandr Test Automation Portfolio",
    short_name: "OleksandrQA",
    description:
      "Portfolio von Oleksandr — Web-Testautomatisierung mit Playwright, TypeScript und einer öffentlichen E2E-Suite in der CI.",
    start_url: "/de",
    display: "standalone",
    background_color: "#101213",
    theme_color: "#101213",
    lang: "de-DE",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
