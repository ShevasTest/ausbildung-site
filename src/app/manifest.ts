import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oleksandr Ausbildung Portfolio",
    short_name: "OleksandrPortfolio",
    description:
      "Portfolio von Oleksandr — angehender Fachinformatiker für Anwendungsentwicklung mit praxisnahen Produkt-Demos.",
    start_url: "/de",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
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
