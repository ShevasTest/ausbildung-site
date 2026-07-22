import { ImageResponse } from "next/og";
import { normalizeLocale } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const copy = {
  de: {
    badge: "Frontend · React/Next.js",
    title: "Oleksandr",
    subtitle: "Frontend-Entwicklung · React/Next.js · KI-gestützt",
    points: "React · Next.js · TypeScript · eigene E2E-Suite",
  },
  en: {
    badge: "Frontend · React/Next.js",
    title: "Oleksandr",
    subtitle: "Frontend Development · React/Next.js · AI-assisted",
    points: "React · Next.js · TypeScript · own e2e suite",
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
          background: "#101213",
          backgroundImage:
            "radial-gradient(rgba(94, 207, 154, 0.16) 1.6px, transparent 1.6px)",
          backgroundSize: "22px 22px",
          color: "#ECEDED",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "64px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "36px",
            left: "36px",
            width: "26px",
            height: "26px",
            borderTop: "3px solid #5ECF9A",
            borderLeft: "3px solid #5ECF9A",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            right: "36px",
            width: "26px",
            height: "26px",
            borderBottom: "3px solid #E3B04B",
            borderRight: "3px solid #E3B04B",
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
              padding: "8px 18px",
              borderRadius: "999px",
              border: "1px solid rgba(94, 207, 154, 0.55)",
              color: "#5ECF9A",
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            {text.badge}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ fontSize: "86px", fontWeight: 700, lineHeight: 1 }}>{text.title}</div>
            <div style={{ fontSize: "40px", fontWeight: 500, maxWidth: "950px", lineHeight: 1.18, color: "#C9CFCB" }}>
              {text.subtitle}
            </div>
            <div style={{ display: "flex", fontSize: "28px", fontWeight: 500 }}>
              <span style={{ color: "#E3B04B", marginRight: "14px" }}>{">"}</span>
              <span style={{ color: "#5ECF9A" }}>{text.points}</span>
            </div>
          </div>

          <div style={{ fontSize: "24px", color: "#9AA19E", fontWeight: 500 }}>
            work.oleksandr-shevchenko.de
          </div>
        </div>
      </div>
    ),
    size,
  );
}
