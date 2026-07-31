import type { Metadata } from "next";
import { Archivo, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PwaRegister } from "@/components/pwa-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import { localeToOpenGraphLocale, localizedPath, normalizeLocale, siteConfig } from "@/lib/seo";
import "../globals.css";

const sansFace = Instrument_Sans({
  variable: "--font-sans-face",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monoFace = Spline_Sans_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const displayFace = Archivo({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const themeScript = `
(function () {
  document.documentElement.setAttribute('data-theme', 'light');
})();
`;

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LocaleLayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = normalizeLocale(locale);
  const t = await getTranslations({ locale: safeLocale, namespace: "Meta" });

  const canonicalPath = localizedPath(safeLocale, "/");
  const imagePath = localizedPath(safeLocale, "/opengraph-image");

  return {
    metadataBase: new URL(siteConfig.baseUrl),
    applicationName: "Oleksandr Daten- & KI-Portfolio",
    title: t("title"),
    description: t("description"),
    keywords: [
      "Junior Data Engineer Germany",
      "Junior AI Engineer",
      "Datenaufbereitung",
      "RAG",
      "Embeddings",
      "Python Automatisierung",
      "Bewerbung Deutschland",
    ],
    authors: [{ name: siteConfig.authorName, url: siteConfig.baseUrl }],
    creator: siteConfig.authorName,
    publisher: siteConfig.authorName,
    manifest: "/manifest.webmanifest",
    alternates: {
      canonical: canonicalPath,
      languages: {
        de: "/de",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      title: t("ogTitle"),
      description: t("ogDescription"),
      locale: localeToOpenGraphLocale(safeLocale),
      url: canonicalPath,
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: t("ogTitle"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [imagePath],
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
    category: "technology",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const skipLinkLabel = locale === "de" ? "Zum Inhalt springen" : "Skip to main content";

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${sansFace.variable} ${monoFace.variable} ${displayFace.variable} bg-background text-foreground font-sans antialiased`}
      >
        <PwaRegister />
        <NextIntlClientProvider locale={locale} messages={null}>
          <div className="min-h-screen bg-background text-foreground">
            <a href="#main-content" className="skip-link">
              {skipLinkLabel}
            </a>
            <SiteHeader locale={locale} />
            <div id="main-content" tabIndex={-1}>
              {children}
            </div>
            <SiteFooter locale={locale} />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
