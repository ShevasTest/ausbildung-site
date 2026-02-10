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
      title: "Dieses Portfolio",
      subtitle: "i18n, Lighthouse 95+, WCAG AA und mobile-first UX",
    },
    en: {
      title: "This Portfolio",
      subtitle: "i18n, Lighthouse 95+, WCAG AA and mobile-first UX",
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
      ? "Projekt-Demo im Ausbildung Portfolio"
      : "Project demo from the Ausbildung portfolio";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(160deg, #0F172A 0%, #111827 54%, #0A0A0F 100%)",
          color: "#F8FAFC",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "58px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "68px",
            top: "52px",
            width: "240px",
            height: "240px",
            borderRadius: "24px",
            border: "1px solid rgba(59,130,246,0.32)",
            background: "rgba(59,130,246,0.12)",
            transform: "rotate(15deg)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "124px",
            bottom: "48px",
            width: "168px",
            height: "168px",
            borderRadius: "20px",
            border: "1px solid rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.12)",
            transform: "rotate(-12deg)",
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
              border: "1px solid rgba(16, 185, 129, 0.5)",
              color: "#6EE7B7",
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
            <div style={{ fontSize: "34px", color: "#E2E8F0", fontWeight: 500, lineHeight: 1.2 }}>
              {subtitle}
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px", alignItems: "center", fontSize: "24px" }}>
            <span style={{ color: "#60A5FA", fontWeight: 600 }}>Alexander Portfolio</span>
            <span style={{ color: "#64748B" }}>•</span>
            <span style={{ color: "#CBD5E1" }}>Next.js · TypeScript</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
