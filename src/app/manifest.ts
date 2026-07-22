import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oleksandr Frontend Portfolio",
    short_name: "OleksandrFE",
    description:
      "Portfolio von Oleksandr — Frontend-Entwicklung mit React, Next.js und TypeScript, plus einer öffentlichen Playwright-E2E-Suite in der CI.",
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
