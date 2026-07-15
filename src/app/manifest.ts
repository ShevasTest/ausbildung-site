import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oleksandr Developer Portfolio",
    short_name: "OleksandrDev",
    description:
      "Portfolio von Oleksandr — Junior Developer mit KI-gestütztem Workflow und praxisnahen Produkt-Demos.",
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
