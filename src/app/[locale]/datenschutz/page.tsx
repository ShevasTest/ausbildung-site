import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { legalIdentity } from "@/lib/legal";
import { localeToOpenGraphLocale, localizedPath, normalizeLocale, siteConfig } from "@/lib/seo";

type DatenschutzPageProps = {
  params: Promise<{ locale: string }>;
};

type LegalSection = {
  title: string;
  paragraphs: string[];
  list?: string[];
  link?: { label: string; href: string };
};

type DatenschutzCopy = {
  title: string;
  metaDescription: string;
  responsibleTitle: string;
  responsibleIntro: string;
  emailLabel: string;
  sections: LegalSection[];
  updated: string;
  back: string;
};

const COPY: Record<"de" | "en", DatenschutzCopy> = {
  de: {
    title: "Datenschutzerklärung",
    metaDescription:
      "Datenschutzerklärung von work.oleksandr-shevchenko.de: Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.",
    responsibleTitle: "1. Verantwortlicher",
    responsibleIntro: "Verantwortlich für die Datenverarbeitung auf dieser Website ist:",
    emailLabel: "E-Mail:",
    sections: [
      {
        title: "2. Überblick",
        paragraphs: [
          "Diese Website ist ein privates, nicht-kommerzielles Portfolio. Sie setzt keine Cookies, verwendet keine Tracking- oder Analyse-Tools und zeigt keine Werbung. Personenbezogene Daten werden nur verarbeitet, soweit dies für die Bereitstellung der Website und die unten beschriebenen Funktionen erforderlich ist.",
        ],
      },
      {
        title: "3. Hosting (Vercel)",
        paragraphs: [
          "Die Website wird bei Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA gehostet. Beim Aufruf der Website verarbeitet Vercel automatisch technische Zugriffsdaten (insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite und User-Agent). Diese Daten sind für die Auslieferung der Inhalte sowie für Stabilität und Sicherheit erforderlich. Die Speicherdauer richtet sich nach den vertraglichen Einstellungen und den Angaben von Vercel.",
          "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und effizienten Betrieb der Website). Soweit Daten in die USA übermittelt werden, erfolgt dies auf Grundlage des EU-US Data Privacy Framework bzw. der EU-Standardvertragsklauseln.",
        ],
        link: {
          label: "Datenschutzerklärung von Vercel",
          href: "https://vercel.com/legal/privacy-notice",
        },
      },
      {
        title: "4. E-Mail-Kontakt",
        paragraphs: [
          "Wenn Sie über den auf der Website angebotenen E-Mail-Link Kontakt aufnehmen, öffnet sich Ihr eigenes E-Mail-Programm. Die Nachricht wird nicht über ein Kontaktformular dieser Website übertragen. Die von Ihnen freiwillig übermittelten Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet.",
          "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anbahnung eines Beschäftigungsverhältnisses) bzw. Art. 6 Abs. 1 lit. f DSGVO. Die Nachricht verbleibt in meinem E-Mail-Postfach und wird gelöscht, sobald sie für die Bearbeitung und mögliche Anschlusskommunikation nicht mehr erforderlich ist.",
        ],
      },
      {
        title: "5. KI-Demos (KI-Bewerbungshelfer, SmartChat)",
        paragraphs: [
          "Texteingaben in den KI-Demos werden über eine eigene Server-Route an den jeweils ausgewählten KI-Anbieter (Groq oder OpenRouter; OpenRouter kann Anfragen an wechselnde Modellanbieter weiterleiten) übermittelt — ausschließlich zur Generierung der Antwort. Ihre IP-Adresse wird dabei nicht direkt an den KI-Anbieter weitergegeben, da die Anfragen über den Server dieser Website laufen. Die Website speichert Ihre Eingaben nicht dauerhaft.",
          "Bitte geben Sie in die KI-Demos keine personenbezogenen oder vertraulichen Daten ein. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Bereitstellung der Demo-Funktionalität). Ist kein KI-Anbieter konfiguriert, läuft ein lokaler Demo-Modus ohne Datenübermittlung an Dritte.",
          "Zur Missbrauchsvermeidung gilt auch hier ein Rate-Limiting mit kurzzeitiger Verarbeitung der IP-Adresse im Arbeitsspeicher.",
        ],
      },
      {
        title: "6. DevDash-Demo (externe Datenquellen)",
        paragraphs: [
          "Beim Öffnen des DevDash-Demos lädt Ihr Browser Wetterdaten direkt von Open-Meteo (open-meteo.com) und Schlagzeilen direkt von der Hacker-News-API (hacker-news.firebaseio.com, betrieben über Google Firebase). Dabei wird Ihre IP-Adresse technisch bedingt an diese Anbieter übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Funktionsfähigkeit der Demo).",
          "GitHub-Aktivitätsdaten werden serverseitig geladen; dabei wird Ihre IP-Adresse nicht an GitHub übermittelt.",
        ],
      },
      {
        title: "7. Lokale Speicherung im Browser (localStorage)",
        paragraphs: [
          "Für rein funktionale Zwecke speichert die Website Einstellungen ausschließlich lokal in Ihrem Browser: Widget-Reihenfolge, Notizen, Fokusdauer und Sitzungszähler des DevDash-Demos sowie Unterhaltungen und Antwortstil des SmartChat-Demos. Der DevDash-Newsfeed kann zusätzlich kurzzeitig im sessionStorage zwischengespeichert werden. Diese Daten verlassen Ihren Browser nicht und sind für mich nicht einsehbar.",
          "Die Speicherung ist für die von Ihnen gewünschte Funktion erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG); eine Einwilligung ist daher nicht notwendig. Sie können die Daten jederzeit über die Browsereinstellungen (Websitedaten löschen) entfernen. Cookies werden nicht gesetzt.",
        ],
      },
      {
        title: "8. Ihre Rechte",
        paragraphs: [
          "Ihnen stehen bezüglich Ihrer personenbezogenen Daten folgende Rechte zu:",
        ],
        list: [
          "Auskunft (Art. 15 DSGVO)",
          "Berichtigung (Art. 16 DSGVO)",
          "Löschung (Art. 17 DSGVO)",
          "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
          "Datenübertragbarkeit (Art. 20 DSGVO)",
          "Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)",
          "Beschwerde bei einer Datenschutzaufsichtsbehörde (Art. 77 DSGVO)",
        ],
      },
      {
        title: "9. Schlussbemerkungen",
        paragraphs: [
          "Zur Ausübung Ihrer Rechte genügt eine formlose E-Mail an die oben genannte Adresse. Es findet keine automatisierte Entscheidungsfindung einschließlich Profiling statt. Sie sind nicht verpflichtet, personenbezogene Daten bereitzustellen; ohne Texteingaben können die KI-Demos jedoch keine individuellen Antworten erzeugen.",
          "Diese Datenschutzerklärung wird angepasst, sobald sich die Website oder die Rechtslage ändert.",
        ],
      },
    ],
    updated: "Stand: Juli 2026",
    back: "Zurück zur Startseite",
  },
  en: {
    title: "Privacy Policy",
    metaDescription:
      "Privacy policy of work.oleksandr-shevchenko.de: information about the processing of personal data according to the GDPR.",
    responsibleTitle: "1. Controller",
    responsibleIntro: "The controller responsible for data processing on this website is:",
    emailLabel: "Email:",
    sections: [
      {
        title: "2. Overview",
        paragraphs: [
          "This website is a private, non-commercial portfolio. It sets no cookies, uses no tracking or analytics tools and displays no advertising. Personal data is only processed to the extent necessary to provide the website and the features described below.",
        ],
      },
      {
        title: "3. Hosting (Vercel)",
        paragraphs: [
          "This website is hosted by Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA. When you visit the website, Vercel automatically processes technical access data (in particular IP address, date and time of access, requested page and user agent). This data is required to deliver the content and ensure stability and security. Retention depends on the contractual settings and the information provided by Vercel.",
          "The legal basis is Art. 6(1)(f) GDPR (legitimate interest in a secure and efficient operation of the website). Where data is transferred to the USA, this is based on the EU-US Data Privacy Framework and/or the EU Standard Contractual Clauses.",
        ],
        link: {
          label: "Vercel privacy policy",
          href: "https://vercel.com/legal/privacy-notice",
        },
      },
      {
        title: "4. Email contact",
        paragraphs: [
          "When you use the email link provided on this website, your own email application opens. The message is not transmitted through a contact form on this website. Any data you voluntarily send is used exclusively to handle your request.",
          "The legal basis is Art. 6(1)(b) GDPR (steps prior to entering into an employment relationship) and/or Art. 6(1)(f) GDPR. The message remains in my email inbox and is deleted once it is no longer required for handling and possible follow-up communication.",
        ],
      },
      {
        title: "5. AI demos (AI Application Assistant, SmartChat)",
        paragraphs: [
          "Text you enter in the AI demos is forwarded through this website's own server route to the selected AI provider (Groq or OpenRouter; OpenRouter may route requests to changing model providers) — exclusively to generate the response. Your IP address is not sent directly to the AI provider, since requests are proxied through this website's server. The website does not store your inputs permanently.",
          "Please do not enter any personal or confidential data into the AI demos. The legal basis is Art. 6(1)(f) GDPR (provision of the demo functionality). If no AI provider is configured, a local demo mode runs without any data transfer to third parties.",
          "To prevent abuse, rate limiting applies here as well, with brief in-memory processing of the IP address.",
        ],
      },
      {
        title: "6. DevDash demo (external data sources)",
        paragraphs: [
          "When you open the DevDash demo, your browser loads weather data directly from Open-Meteo (open-meteo.com) and headlines directly from the Hacker News API (hacker-news.firebaseio.com, operated via Google Firebase). For technical reasons, your IP address is transmitted to these providers. The legal basis is Art. 6(1)(f) GDPR (functionality of the demo).",
          "GitHub activity data is loaded server-side; your IP address is not transmitted to GitHub.",
        ],
      },
      {
        title: "7. Local storage in your browser (localStorage)",
        paragraphs: [
          "For purely functional purposes, the website stores settings exclusively in your browser: widget order, notes, focus duration and session count for DevDash, plus conversations and response style for SmartChat. The DevDash news feed may also be cached temporarily in sessionStorage. This data never leaves your browser and is not accessible to me.",
          "This storage is required for the feature you requested (§ 25(2) no. 2 of the German TDDDG); consent is therefore not required. You can remove the data at any time via your browser settings (clear site data). No cookies are set.",
        ],
      },
      {
        title: "8. Your rights",
        paragraphs: ["Regarding your personal data, you have the following rights:"],
        list: [
          "Access (Art. 15 GDPR)",
          "Rectification (Art. 16 GDPR)",
          "Erasure (Art. 17 GDPR)",
          "Restriction of processing (Art. 18 GDPR)",
          "Data portability (Art. 20 GDPR)",
          "Objection to processing based on Art. 6(1)(f) GDPR (Art. 21 GDPR)",
          "Complaint to a data protection supervisory authority (Art. 77 GDPR)",
        ],
      },
      {
        title: "9. Final remarks",
        paragraphs: [
          "To exercise your rights, an informal email to the address above is sufficient. No automated decision-making, including profiling, takes place. You are not obliged to provide personal data; however, without text input the AI demos cannot generate individual responses.",
          "This privacy policy will be updated whenever the website or the legal situation changes.",
        ],
      },
    ],
    updated: "Last updated: July 2026",
    back: "Back to homepage",
  },
};

export async function generateMetadata({ params }: DatenschutzPageProps): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = normalizeLocale(locale);
  const copy = COPY[safeLocale];
  const canonicalPath = localizedPath(safeLocale, "/datenschutz");

  return {
    title: copy.title,
    description: copy.metaDescription,
    alternates: {
      canonical: canonicalPath,
      languages: {
        de: "/de/datenschutz",
        en: "/en/datenschutz",
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

export default async function DatenschutzPage({ params }: DatenschutzPageProps) {
  const { locale } = await params;
  const safeLocale = normalizeLocale(locale);
  setRequestLocale(safeLocale);

  const copy = COPY[safeLocale];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>

        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">{copy.responsibleTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{copy.responsibleIntro}</p>
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
            <br />
            {copy.emailLabel}{" "}
            <a href={`mailto:${legalIdentity.email}`} className="font-medium text-primary underline-offset-4 hover:underline">
              {legalIdentity.email}
            </a>
          </p>
        </section>

        {copy.sections.map((section) => (
          <section key={section.title} className="mt-8">
            <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
            {section.list ? (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-muted">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.link ? (
              <p className="mt-3 leading-relaxed text-muted">
                <a
                  href={section.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {section.link.label}
                </a>
              </p>
            ) : null}
          </section>
        ))}

        <p className="mt-8 text-sm text-muted">{copy.updated}</p>

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
