import { ImageResponse } from "next/og";
import { normalizeLocale } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const projectCopy = {
  "ki-bewerbungshelfer": {
    de: {
      title: "KI-Bewerbungshelfer",
      subtitle: "Stellenanalyse + personalisierte Anschreiben mit Streaming UI",
    },
    en: {
      title: "AI Application Assistant",
      subtitle: "Job post analysis + personalized cover letter generation",
    },
  },
  "mietpreise-tracker": {
    de: {
      title: "Mietpreise-Tracker",
      subtitle: "Miettrends deutscher Städte mit Einkommensrechner",
    },
    en: {
      title: "Rent Price Tracker",
      subtitle: "German city rent trends with affordability calculator",
    },
  },
  smartchat: {
    de: {
      title: "SmartChat",
      subtitle: "AI-Chat mit Streaming, Markdown und Multi-Thread-Verlauf",
    },
    en: {
      title: "SmartChat",
      subtitle: "AI chat with streaming output, markdown and thread history",
    },
  },
  devdash: {
    de: {
      title: "DevDash",
      subtitle: "Widget-Dashboard mit Drag-and-Drop und PWA-Flow",
    },
    en: {
      title: "DevDash",
      subtitle: "Widget dashboard with drag-and-drop layout and PWA flow",
    },
  },
  portfolio: {
    de: {
      title: "Portfolio-Website",
      subtitle: "Mehrsprachig, responsiv und auf Junior-Stellen ausgerichtet",
    },
    en: {
      title: "Portfolio Website",
      subtitle: "Multilingual, responsive and tailored for junior applications",
    },
  },
} as const;

type ProjectSlug = keyof typeof projectCopy;

type ProjectOpenGraphImageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function formatSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ProjectOpenGraphImage({ params }: ProjectOpenGraphImageProps) {
  const { locale, slug } = await params;
  const safeLocale = normalizeLocale(locale);

  const knownProject = projectCopy[slug as ProjectSlug];
  const title = knownProject ? knownProject[safeLocale].title : formatSlug(slug);
  const subtitle = knownProject
    ? knownProject[safeLocale].subtitle
    : safeLocale === "de"
      ? "Projekt-Demo im Developer Portfolio"
      : "Project demo from the developer portfolio";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#101213",
          backgroundImage:
            "radial-gradient(rgba(94, 207, 154, 0.16) 1.6px, transparent 1.6px)",
          backgroundSize: "22px 22px",
          color: "#ECEDED",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "58px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "34px",
            left: "34px",
            width: "24px",
            height: "24px",
            borderTop: "3px solid #5ECF9A",
            borderLeft: "3px solid #5ECF9A",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "34px",
            right: "34px",
            width: "24px",
            height: "24px",
            borderBottom: "3px solid #E3B04B",
            borderRight: "3px solid #E3B04B",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 1,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              border: "1px solid rgba(94, 207, 154, 0.55)",
              color: "#5ECF9A",
              borderRadius: "999px",
              padding: "8px 16px",
              fontWeight: 600,
              fontSize: "21px",
              letterSpacing: "0.03em",
            }}
          >
            {safeLocale === "de" ? "Projekt-Demo" : "Project Demo"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "850px" }}>
            <div style={{ fontSize: "74px", fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
            <div style={{ fontSize: "34px", color: "#C9CFCB", fontWeight: 500, lineHeight: 1.2 }}>
              {subtitle}
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px", alignItems: "center", fontSize: "24px" }}>
            <span style={{ color: "#5ECF9A", fontWeight: 600 }}>oleksandr-shevchenko.de</span>
            <span style={{ color: "#5B6260" }}>•</span>
            <span style={{ color: "#9AA19E" }}>Next.js · TypeScript</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
