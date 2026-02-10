import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import { localeToOpenGraphLocale, localizedPath, normalizeLocale } from "@/lib/seo";

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
    title: t("title"),
    description: t("description"),
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
  );
}
