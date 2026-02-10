import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import { siteConfig } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const themeScript = `
(function () {
  try {
    const segment = window.location.pathname.split('/').filter(Boolean)[0];
    const locale = segment === 'en' ? 'en' : 'de';
    document.documentElement.setAttribute('lang', locale);

    const stored = localStorage.getItem('theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = stored || system;
    document.documentElement.setAttribute('data-theme', theme);
  } catch {
    document.documentElement.setAttribute('lang', 'de');
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  applicationName: "Oleksandr Ausbildung Portfolio",
  title: {
    default: "Oleksandr | Ausbildung Portfolio",
    template: "%s | Oleksandr",
  },
  description:
    "Portfolio von Oleksandr — angehender Fachinformatiker für Anwendungsentwicklung.",
  keywords: [
    "Ausbildung Fachinformatiker",
    "Frontend Portfolio",
    "Next.js",
    "TypeScript",
    "Bewerbung Deutschland",
    "Junior Developer Germany",
  ],
  authors: [{ name: siteConfig.authorName, url: siteConfig.baseUrl }],
  creator: siteConfig.authorName,
  publisher: siteConfig.authorName,
  manifest: "/manifest.webmanifest",
  alternates: {
    languages: {
      de: "/de",
      en: "/en",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.siteName,
    title: "Oleksandr | Ausbildung Portfolio",
    description:
      "Moderne Frontend-Projekte mit Fokus auf Performance, Accessibility und sauberer Architektur.",
    locale: "de_DE",
    url: "/de",
    images: [
      {
        url: "/de/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Oleksandr Ausbildung Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oleksandr | Ausbildung Portfolio",
    description:
      "Moderne Frontend-Projekte mit Fokus auf Performance, Accessibility und sauberer Architektur.",
    images: ["/de/opengraph-image"],
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} bg-background text-foreground font-sans antialiased`}
      >
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
