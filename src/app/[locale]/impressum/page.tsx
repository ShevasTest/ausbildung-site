import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { legalIdentity } from "@/lib/legal";
import { localeToOpenGraphLocale, localizedPath, normalizeLocale, siteConfig } from "@/lib/seo";

type ImpressumPageProps = {
  params: Promise<{ locale: string }>;
};

const COPY = {
  de: {
    title: "Impressum",
    metaDescription: "Impressum und Anbieterkennzeichnung von oleksandr-shevchenko.de gemäß § 5 DDG.",
    providerTitle: "Angaben gemäß § 5 DDG",
    contactTitle: "Kontakt",
    emailLabel: "E-Mail:",
    responsibleTitle: "Verantwortlich für den Inhalt",
    purposeTitle: "Hinweis zum Angebot",
    purposeText:
      "Diese Website ist ein privates, nicht-kommerzielles Portfolio. Sie dient ausschließlich der persönlichen Vorstellung im Rahmen der Suche nach einem Ausbildungsplatz als Fachinformatiker für Anwendungsentwicklung.",
    linksTitle: "Haftung für Links",
    linksText:
      "Diese Website enthält Links zu externen Websites Dritter (z. B. GitHub, LinkedIn), auf deren Inhalte ich keinen Einfluss habe. Für diese fremden Inhalte ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Zum Zeitpunkt der Verlinkung waren keine rechtswidrigen Inhalte erkennbar.",
    back: "Zurück zur Startseite",
    privacyHint: "Informationen zur Verarbeitung personenbezogener Daten finden Sie in der",
    privacyLinkLabel: "Datenschutzerklärung",
  },
  en: {
    title: "Legal Notice (Impressum)",
    metaDescription:
      "Legal notice and provider identification for oleksandr-shevchenko.de according to Section 5 DDG (German Digital Services Act).",
    providerTitle: "Information according to § 5 DDG (German Digital Services Act)",
    contactTitle: "Contact",
    emailLabel: "Email:",
    responsibleTitle: "Responsible for the content",
    purposeTitle: "About this website",
    purposeText:
      "This website is a private, non-commercial portfolio. Its sole purpose is my personal presentation while applying for an apprenticeship (Ausbildung) as Fachinformatiker für Anwendungsentwicklung.",
    linksTitle: "Liability for links",
    linksText:
      "This website contains links to external third-party websites (e.g. GitHub, LinkedIn) whose content I cannot control. The respective provider or operator of the linked pages is always responsible for their content. No unlawful content was identifiable at the time of linking.",
    back: "Back to homepage",
    privacyHint: "Information about the processing of personal data can be found in the",
    privacyLinkLabel: "privacy policy",
  },
} as const;

export async function generateMetadata({ params }: ImpressumPageProps): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = normalizeLocale(locale);
  const copy = COPY[safeLocale];
  const canonicalPath = localizedPath(safeLocale, "/impressum");

  return {
    title: copy.title,
    description: copy.metaDescription,
    alternates: {
      canonical: canonicalPath,
      languages: {
        de: "/de/impressum",
        en: "/en/impressum",
      },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.siteName,
      title: copy.title,
      description: copy.metaDescription,
      locale: localeToOpenGraphLocale(safeLocale),
      url: canonicalPath,
    },
  };
}

export default async function ImpressumPage({ params }: ImpressumPageProps) {
  const { locale } = await params;
  const safeLocale = normalizeLocale(locale);
  setRequestLocale(safeLocale);

  const copy = COPY[safeLocale];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>

        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">{copy.providerTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">
            {legalIdentity.name}
            {legalIdentity.addressLines.map((line) => (
              <span key={line}>
                <br />
                {line}
              </span>
            ))}
            <br />
            {legalIdentity.country}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">{copy.contactTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">
            {copy.emailLabel}{" "}
            <a href={`mailto:${legalIdentity.email}`} className="font-medium text-primary underline-offset-4 hover:underline">
              {legalIdentity.email}
            </a>
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">{copy.responsibleTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{legalIdentity.name}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">{copy.purposeTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{copy.purposeText}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">{copy.linksTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{copy.linksText}</p>
        </section>

        <p className="mt-8 text-sm leading-relaxed text-muted">
          {copy.privacyHint}{" "}
          <Link href="/datenschutz" className="font-medium text-primary underline-offset-4 hover:underline">
            {copy.privacyLinkLabel}
          </Link>
          .
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
        >
          ← {copy.back}
        </Link>
      </div>
    </main>
  );
}
