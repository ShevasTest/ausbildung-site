import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type SiteFooterProps = {
  locale: string;
};

export async function SiteFooter({ locale }: SiteFooterProps) {
  const t = await getTranslations({ locale, namespace: "Footer" });

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="portfolio-shell flex flex-col gap-4 py-7 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{t("rights", { year: new Date().getFullYear() })}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ul
            aria-label={locale === "de" ? "Rechtliches" : "Legal"}
            className="flex items-center gap-4"
          >
            <li>
              <Link href="/impressum" className="inline-flex min-h-6 items-center transition hover:text-primary">
                {locale === "de" ? "Impressum" : "Legal Notice"}
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="inline-flex min-h-6 items-center transition hover:text-primary">
                {locale === "de" ? "Datenschutz" : "Privacy"}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
