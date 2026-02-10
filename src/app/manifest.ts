import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alexander Ausbildung Portfolio",
    short_name: "AlexPortfolio",
    description:
      "Portfolio von Alexander — angehender Fachinformatiker für Anwendungsentwicklung mit praxisnahen Produkt-Demos.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    lang: "de-DE",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
