import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

type SiteHeaderProps = {
  locale: string;
};

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const t = await getTranslations({ locale, namespace: "Nav" });
  const homeHref = `/${locale}`;
  const homeLabel = locale === "de" ? "Zur Startseite" : "Go to homepage";
  const navLabel = locale === "de" ? "Hauptnavigation" : "Main navigation";
  const mobileNavLabel = locale === "de" ? "Abschnittsnavigation" : "Section navigation";

  const sections = [
    { id: "hero", label: t("hero") },
    { id: "about", label: t("about") },
    { id: "projects", label: t("projects") },
    { id: "skills", label: t("skills") },
    { id: "resume", label: t("resume") },
    { id: "contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/92">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <a
          href={homeHref}
          aria-label={homeLabel}
          className="max-w-[8.75rem] truncate text-base font-semibold tracking-tight text-primary sm:max-w-none sm:text-lg"
        >
          {t("brand")}
        </a>

        <nav aria-label={navLabel} className="hidden items-center gap-4 text-sm text-muted md:flex">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`${homeHref}#${section.id}`}
              className="transition hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <nav
        aria-label={mobileNavLabel}
        className="mx-auto flex w-full max-w-6xl items-center gap-2 overflow-x-auto px-4 pb-2 text-xs text-muted md:hidden sm:px-6 sm:pb-3 sm:text-sm"
      >
        {sections.map((section) => (
          <a
            key={section.id}
            href={`${homeHref}#${section.id}`}
            className="whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1.5 transition hover:text-foreground sm:px-3"
          >
            {section.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
