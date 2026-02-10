import { ImageResponse } from "next/og";
import { normalizeLocale } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const copy = {
  de: {
    badge: "Ausbildung Portfolio 2026",
    title: "Oleksandr",
    subtitle: "Angehender Fachinformatiker für Anwendungsentwicklung",
    points: "Next.js · TypeScript · Performance · Accessibility",
  },
  en: {
    badge: "Ausbildung Portfolio 2026",
    title: "Oleksandr",
    subtitle: "Aspiring Software Developer (Fachinformatiker AE)",
    points: "Next.js · TypeScript · Performance · Accessibility",
  },
} as const;

type OpenGraphImageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { locale } = await params;
  const safeLocale = normalizeLocale(locale);
  const text = copy[safeLocale];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #0A0A0F 0%, #111827 48%, #0A0A0F 100%)",
          color: "#F8FAFC",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "64px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: "72px",
            width: "220px",
            height: "220px",
            borderRadius: "999px",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            background: "rgba(59, 130, 246, 0.14)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "42px",
            left: "58px",
            width: "180px",
            height: "180px",
            borderRadius: "999px",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            background: "rgba(16, 185, 129, 0.12)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(59, 130, 246, 0.5)",
              color: "#93C5FD",
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "0.03em",
            }}
          >
            {text.badge}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ fontSize: "82px", fontWeight: 700, lineHeight: 1 }}>{text.title}</div>
            <div style={{ fontSize: "42px", fontWeight: 500, maxWidth: "950px", lineHeight: 1.15 }}>
              {text.subtitle}
            </div>
            <div style={{ color: "#34D399", fontSize: "28px", fontWeight: 500 }}>{text.points}</div>
          </div>

          <div style={{ fontSize: "24px", color: "#CBD5E1", fontWeight: 500 }}>
            alex-ausbildung-portfolio.vercel.app
          </div>
        </div>
      </div>
    ),
    size,
  );
}
