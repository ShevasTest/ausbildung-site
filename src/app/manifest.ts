import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oleksandr Shevchenko Portfolio",
    short_name: "OleksandrData",
    description:
      "Portfolio von Oleksandr Shevchenko — Datenpflege, Digitalisierung und Automatisierung wiederkehrender Web- und Datenaufgaben.",
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
