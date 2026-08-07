import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oleksandr Shevchenko — IT-Support",
    short_name: "OleksandrData",
    description:
      "Portfolio von Oleksandr — Datenaufbereitung, Automatisierung und KI-Agenten, plus einem öffentlichen RAG-Agenten über eine OpenAPI-Spezifikation.",
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
