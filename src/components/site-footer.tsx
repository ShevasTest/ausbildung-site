import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type SiteFooterProps = {
  locale: string;
};

export async function SiteFooter({ locale }: SiteFooterProps) {
  const t = await getTranslations({ locale, namespace: "Footer" });

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t("rights", { year: new Date().getFullYear() })}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ul
            aria-label={locale === "de" ? "Externe Profile" : "External profiles"}
            className="flex items-center gap-4"
          >
            <li>
              <a
                href="https://github.com/ShevasTest"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-primary"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="mailto:oleksandr.o.shevchenko@gmail.com"
                className="transition hover:text-primary"
              >
                {locale === "de" ? "E-Mail" : "Email"}
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/oleksandr-it/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-primary"
              >
                LinkedIn
              </a>
            </li>
          </ul>

          <span aria-hidden className="hidden h-4 w-px bg-border sm:block" />

          <ul
            aria-label={locale === "de" ? "Rechtliches" : "Legal"}
            className="flex items-center gap-4"
          >
            <li>
              <Link href="/impressum" className="transition hover:text-primary">
                {locale === "de" ? "Impressum" : "Legal Notice"}
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="transition hover:text-primary">
                {locale === "de" ? "Datenschutz" : "Privacy"}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
