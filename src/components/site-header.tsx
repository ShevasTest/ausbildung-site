import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";

type SiteHeaderProps = {
  locale: string;
};

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const t = await getTranslations({ locale, namespace: "Nav" });
  const homeHref = `/${locale}`;
  const homeLabel = locale === "de" ? "Zur Startseite" : "Go to homepage";
  const navLabel = locale === "de" ? "Hauptnavigation" : "Main navigation";
  const sections = [
    { id: "projects", label: t("projects") },
    { id: "resume", label: t("resume") },
    { id: "about", label: t("about") },
    { id: "contact", label: t("contact") },
  ];

  return (
    <header className="portfolio-header">
      <div className="portfolio-shell flex items-center justify-between gap-4 py-4 sm:py-5">
        <a
          href={homeHref}
          aria-label={homeLabel}
          className="font-display flex min-w-0 items-center gap-2.5 text-[15px] font-semibold tracking-tight text-foreground sm:text-base"
        >
          <span
            aria-hidden
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-solid font-mono text-[10px] font-bold text-white"
          >
            OS
          </span>
          <span className="sm:hidden">Oleksandr</span>
          <span className="hidden sm:inline">{t("brand")}</span>
        </a>

        <nav aria-label={navLabel} className="hidden items-center gap-7 text-sm text-muted md:flex">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`${homeHref}#${section.id}`}
              className="nav-link transition hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
